import { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseState, Category } from "./types";
import { readDatabase, writeDatabase } from "./server-db";
import {
  isSupabaseConfigured,
  getSupabaseAdmin,
  mapCategoryFromDb,
  mapProductFromDb,
  mapOrderFromDb,
  mapCustomerFromDb,
  mapStockMovementFromDb,
  mapCouponFromDb,
  mapStoreSettingsFromDb,
  mapCategoryToDb,
  mapProductToDb,
  mapOrderToDb,
  mapOrderItemToDb,
  mapCustomerToDb,
  mapStockMovementToDb,
  mapCouponToDb,
} from "./supabase";

export class StoreConflictError extends Error {
  status: number;
  constructor(message: string, status = 409) {
    super(message);
    this.status = status;
  }
}

export async function loadAuthoritativeDb(): Promise<DatabaseState> {
  const fallbackState = readDatabase();

  if (!isSupabaseConfigured()) {
    return fallbackState;
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return fallbackState;
  }

  const [
    settingsRes,
    categoriesRes,
    productsRes,
    ordersRes,
    itemsRes,
    customersRes,
    movementsRes,
    couponsRes,
  ] = await Promise.all([
    client.from("store_settings").select("*").eq("id", "default").maybeSingle(),
    client.from("categories").select("*").order("sort_order", { ascending: true }),
    client.from("products").select("*").order("created_at", { ascending: false }),
    client.from("orders").select("*").order("created_at", { ascending: false }),
    client.from("order_items").select("*"),
    client.from("customers").select("*").order("created_at", { ascending: false }),
    client.from("stock_movements").select("*").order("created_at", { ascending: false }),
    client.from("coupons").select("*").order("created_at", { ascending: false }),
  ]);

  if (categoriesRes.error || productsRes.error) {
    throw new Error(
      `Error leyendo Supabase: ${categoriesRes.error?.message || productsRes.error?.message}`
    );
  }

  const itemsByOrder = (itemsRes.data || []).reduce((acc: Record<string, any[]>, item: any) => {
    acc[item.order_id] = acc[item.order_id] || [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  return {
    settings: mapStoreSettingsFromDb(settingsRes.data, fallbackState.settings),
    categories: (categoriesRes.data || []).map(mapCategoryFromDb),
    products: (productsRes.data || []).map(mapProductFromDb),
    orders: (ordersRes.data || []).map((o) =>
      mapOrderFromDb(o, itemsByOrder[o.id] || [])
    ),
    customers: (customersRes.data || []).map(mapCustomerFromDb),
    stockMovements: (movementsRes.data || []).map(mapStockMovementFromDb),
    coupons: (couponsRes.data || []).map(mapCouponFromDb),
  };
}

async function syncTableByDiff(
  client: SupabaseClient,
  table: string,
  mappedRows: any[],
  nextIds: string[],
  onConflictColumn?: string
) {
  const { data: existingRows, error: fetchErr } = await client.from(table).select("id");
  if (fetchErr) {
    throw new Error(`Error consultando ${table}: ${fetchErr.message}`);
  }

  if (mappedRows.length > 0) {
    const upsertOpts = onConflictColumn ? { onConflict: onConflictColumn } : undefined;
    const { error: upsertErr } = await client.from(table).upsert(mappedRows, upsertOpts);
    if (upsertErr) {
      throw new Error(`Error guardando en ${table}: ${upsertErr.message}`);
    }
  }

  const nextIdSet = new Set(nextIds);
  const idsToDelete = (existingRows || [])
    .map((r: { id: string }) => r.id)
    .filter((id: string) => !nextIdSet.has(id));

  if (idsToDelete.length > 0) {
    const { error: delErr } = await client.from(table).delete().in("id", idsToDelete);
    if (delErr) {
      throw new Error(`Error eliminando en ${table}: ${delErr.message}`);
    }
  }
}

async function syncCategoriesToSupabase(client: SupabaseClient, categories: Category[]) {
  const { data: existingCats, error: fetchErr } = await client
    .from("categories")
    .select("id, parent_id");
  if (fetchErr) {
    throw new Error(`Error consultando categorías: ${fetchErr.message}`);
  }

  // Asegurar slugs únicos para evitar violación UNIQUE en Postgres
  const usedSlugs = new Set<string>();
  const normalizedCategories = categories.map((cat) => {
    const baseSlug = (cat.slug || cat.name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `categoria-${cat.id}`;

    let uniqueSlug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(uniqueSlug);
    return { ...cat, slug: uniqueSlug };
  });

  const nextIdSet = new Set(normalizedCategories.map((c) => c.id));
  const idsToDelete = (existingCats || [])
    .map((c: { id: string }) => c.id)
    .filter((id: string) => !nextIdSet.has(id));

  // Verificar si alguna categoría eliminada tiene productos asociados en category_id
  if (idsToDelete.length > 0) {
    const { data: blockingProducts, error: prodCheckErr } = await client
      .from("products")
      .select("id, name, category_id")
      .in("category_id", idsToDelete);

    if (prodCheckErr) {
      throw new Error(`Error verificando productos de categoría: ${prodCheckErr.message}`);
    }

    if (blockingProducts && blockingProducts.length > 0) {
      throw new StoreConflictError(
        `No se puede eliminar la categoría porque tiene ${blockingProducts.length} producto(s) asociado(s). Reasigná o eliminá esos productos primero.`,
        409
      );
    }

    // Limpiar subcategory_id en productos que apuntaban a una subcategoría eliminada
    await client
      .from("products")
      .update({ subcategory_id: null })
      .in("subcategory_id", idsToDelete);
  }

  // Upsert: primero padres (parentId === null), luego subcategorías
  const parents = normalizedCategories.filter((c) => !c.parentId).map(mapCategoryToDb);
  const children = normalizedCategories.filter((c) => Boolean(c.parentId)).map(mapCategoryToDb);

  if (parents.length > 0) {
    const { error: parentErr } = await client.from("categories").upsert(parents);
    if (parentErr) {
      throw new Error(`Error guardando categorías principales: ${parentErr.message}`);
    }
  }
  if (children.length > 0) {
    const { error: childErr } = await client.from("categories").upsert(children);
    if (childErr) {
      throw new Error(`Error guardando subcategorías: ${childErr.message}`);
    }
  }

  // Eliminar primero subcategorías y luego categorías padre
  if (idsToDelete.length > 0) {
    const existingMap = new Map(
      (existingCats || []).map((c: { id: string; parent_id: string | null }) => [c.id, c.parent_id])
    );
    const childDeletes = idsToDelete.filter((id) => Boolean(existingMap.get(id)));
    const parentDeletes = idsToDelete.filter((id) => !existingMap.get(id));

    if (childDeletes.length > 0) {
      const { error: delChildErr } = await client
        .from("categories")
        .delete()
        .in("id", childDeletes);
      if (delChildErr) {
        throw new Error(`Error eliminando subcategorías: ${delChildErr.message}`);
      }
    }
    if (parentDeletes.length > 0) {
      const { error: delParentErr } = await client
        .from("categories")
        .delete()
        .in("id", parentDeletes);
      if (delParentErr) {
        throw new Error(`Error eliminando categorías: ${delParentErr.message}`);
      }
    }
  }
}

export async function persistFullStateToDb(nextState: DatabaseState): Promise<DatabaseState> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseAdmin();
    if (client) {
      // 1. Configuración general
      const { error: settingsErr } = await client.from("store_settings").upsert({
        id: "default",
        store_name: nextState.settings.storeName,
        tagline: nextState.settings.tagline,
        address: nextState.settings.address,
        phone: nextState.settings.phone,
        whatsapp_number: nextState.settings.whatsappNumber,
        email: nextState.settings.email,
        instagram: nextState.settings.instagram,
        facebook: nextState.settings.facebook,
        shipping_cost: nextState.settings.shippingCost,
        free_shipping_threshold: nextState.settings.freeShippingThreshold,
        shipping_carrier: nextState.settings.shippingCarrier,
        promo_banner_text: nextState.settings.promoBannerText,
        hero_title: nextState.settings.heroTitle,
        hero_subtitle: nextState.settings.heroSubtitle,
        mp_enabled: nextState.settings.mpEnabled,
        mp_public_key: nextState.settings.mpPublicKey,
        transfer_enabled: nextState.settings.transferEnabled,
        transfer_discount_pct: nextState.settings.transferDiscountPct,
        bank_alias: nextState.settings.bankAlias,
        bank_cbu: nextState.settings.bankCbu,
        bank_holder: nextState.settings.bankHolder,
      });
      if (settingsErr) {
        throw new Error(`Error guardando configuración: ${settingsErr.message}`);
      }

      // 2. Categorías primero (para que existan FK de productos nuevos), pero si hay productos borrados de una categoría eliminada,
      // borramos productos removidos ANTES de borrar categorías removidas
      const nextProducts = nextState.products || [];
      const nextCategories = nextState.categories || [];

      // Primero upsert de categorías (crea/actualiza antes de insertar productos nuevos)
      const parents = nextCategories.filter((c) => !c.parentId).map(mapCategoryToDb);
      const children = nextCategories.filter((c) => Boolean(c.parentId)).map(mapCategoryToDb);
      if (parents.length > 0) {
        const { error } = await client.from("categories").upsert(parents);
        if (error) throw new Error(`Error guardando categorías: ${error.message}`);
      }
      if (children.length > 0) {
        const { error } = await client.from("categories").upsert(children);
        if (error) throw new Error(`Error guardando subcategorías: ${error.message}`);
      }

      // 3. Productos (upsert + delete de productos eliminados)
      await syncTableByDiff(
        client,
        "products",
        nextProducts.map(mapProductToDb),
        nextProducts.map((p) => p.id)
      );

      // 4. Sincronizar eliminación de categorías (ahora que productos borrados ya fueron removidos)
      await syncCategoriesToSupabase(client, nextCategories);

      // 5. Clientes
      const nextCustomers = nextState.customers || [];
      await syncTableByDiff(
        client,
        "customers",
        nextCustomers.map(mapCustomerToDb),
        nextCustomers.map((c) => c.id)
      );

      // 6. Pedidos e ítems
      const nextOrders = nextState.orders || [];
      await syncTableByDiff(
        client,
        "orders",
        nextOrders.map(mapOrderToDb),
        nextOrders.map((o) => o.id)
      );

      const allItems = nextOrders.flatMap((ord) =>
        (ord.items || []).map((it) => mapOrderItemToDb(it, ord.id))
      );
      await syncTableByDiff(
        client,
        "order_items",
        allItems,
        allItems.map((it) => it.id)
      );

      // 7. Movimientos de inventario
      const nextMovements = nextState.stockMovements || [];
      await syncTableByDiff(
        client,
        "stock_movements",
        nextMovements.map(mapStockMovementToDb),
        nextMovements.map((m) => m.id)
      );

      // 8. Cupones
      const nextCoupons = nextState.coupons || [];
      await syncTableByDiff(
        client,
        "coupons",
        nextCoupons.map(mapCouponToDb),
        nextCoupons.map((c) => c.id)
      );
    }
  }

  writeDatabase(nextState);
  return isSupabaseConfigured() ? await loadAuthoritativeDb() : nextState;
}

