import { NextRequest, NextResponse } from "next/server";
import { readDatabase, writeDatabase } from "@/lib/server-db";
import { INITIAL_DB_STATE } from "@/lib/initial-data";
import { DatabaseState } from "@/lib/types";
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
  mapProductToDb,
  mapOrderToDb,
  mapOrderItemToDb,
  mapCustomerToDb,
  mapStockMovementToDb,
  mapCouponToDb,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
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
          client.from("store_settings").select("*").eq("id", "default").single(),
          client.from("categories").select("*").order("sort_order", { ascending: true }),
          client.from("products").select("*").order("created_at", { ascending: false }),
          client.from("orders").select("*").order("created_at", { ascending: false }),
          client.from("order_items").select("*"),
          client.from("customers").select("*").order("created_at", { ascending: false }),
          client.from("stock_movements").select("*").order("created_at", { ascending: false }),
          client.from("coupons").select("*").order("created_at", { ascending: false }),
        ]);

        if (!settingsRes.error && !categoriesRes.error && !productsRes.error) {
          const fallbackState = readDatabase();
          const itemsByOrder = (itemsRes.data || []).reduce((acc: any, item: any) => {
            acc[item.order_id] = acc[item.order_id] || [];
            acc[item.order_id].push(item);
            return acc;
          }, {});

          const state: DatabaseState = {
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

          return NextResponse.json(state);
        }
      }
    } catch (sbError) {
      console.warn("Aviso: Supabase configurado pero no respondió, usando almacenamiento local:", sbError);
    }
  }

  const db = readDatabase();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body?.action === "RESET_DEMO") {
      const reset = writeDatabase(INITIAL_DB_STATE);
      if (isSupabaseConfigured()) {
        try {
          const client = getSupabaseAdmin();
          if (client) {
            await Promise.all([
              client.from("orders").delete().neq("id", "none"),
              client.from("order_items").delete().neq("id", "none"),
              client.from("products").delete().neq("id", "none"),
              client.from("customers").delete().neq("id", "none"),
              client.from("stock_movements").delete().neq("id", "none"),
              client.from("coupons").delete().neq("id", "none"),
            ]);
          }
        } catch (e) {
          console.warn("Aviso al resetear Supabase:", e);
        }
      }
      return NextResponse.json(reset);
    }

    if (body?.state) {
      const nextState = body.state as DatabaseState;
      const updated = writeDatabase(nextState);

      // Sincronizar todos los cambios con Supabase
      if (isSupabaseConfigured()) {
        try {
          const client = getSupabaseAdmin();
          if (client) {
            // 1. Guardar Configuración General
            await client.from("store_settings").upsert({
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

            // 2. Sincronizar Productos
            if (nextState.products && nextState.products.length > 0) {
              const dbProducts = nextState.products.map(mapProductToDb);
              await client.from("products").upsert(dbProducts);

              // Eliminar productos que hayan sido borrados en admin
              const activeIds = nextState.products.map((p) => p.id);
              await client.from("products").delete().not("id", "in", `(${activeIds.map((id) => `"${id}"`).join(",")})`);
            } else {
              // Si no hay productos, limpiar tabla
              await client.from("products").delete().neq("id", "none");
            }

            // 3. Sincronizar Pedidos e Ítems
            if (nextState.orders && nextState.orders.length > 0) {
              const dbOrders = nextState.orders.map(mapOrderToDb);
              await client.from("orders").upsert(dbOrders);

              for (const ord of nextState.orders) {
                if (ord.items && ord.items.length > 0) {
                  const dbItems = ord.items.map((it) => mapOrderItemToDb(it, ord.id));
                  await client.from("order_items").upsert(dbItems);
                }
              }
            }

            // 4. Sincronizar Clientes
            if (nextState.customers && nextState.customers.length > 0) {
              const dbCustomers = nextState.customers.map(mapCustomerToDb);
              await client.from("customers").upsert(dbCustomers);
            }

            // 5. Sincronizar Movimientos de Inventario
            if (nextState.stockMovements && nextState.stockMovements.length > 0) {
              const dbMovements = nextState.stockMovements.map(mapStockMovementToDb);
              await client.from("stock_movements").upsert(dbMovements);
            }

            // 6. Sincronizar Cupones
            if (nextState.coupons && nextState.coupons.length > 0) {
              const dbCoupons = nextState.coupons.map(mapCouponToDb);
              await client.from("coupons").upsert(dbCoupons);
            }
          }
        } catch (syncErr) {
          console.warn("Aviso al sincronizar con Supabase:", syncErr);
        }
      }

      return NextResponse.json(updated);
    }

    return NextResponse.json(readDatabase());
  } catch (error) {
    console.error("Error updating Vital Sur DB:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la base de datos" },
      { status: 500 }
    );
  }
}
