import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DatabaseState, Product, Category, Order, Customer, StockMovement, Coupon, StoreSettings } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseAnonKey.includes("your-anon-key")
  );
}

// Cliente público para el browser
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente administrativo con service_role (sólo para uso en Node.js / Route Handlers)
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const key = supabaseServiceKey || supabaseAnonKey;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// -------------------------------------------------------------
// Mappers: Convierte entre Postgres snake_case y TypeScript camelCase
// -------------------------------------------------------------

export function mapCategoryFromDb(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    iconName: row.icon_name || "dumbbell",
    order: Number(row.sort_order ?? row.order ?? 1),
    active: Boolean(row.active ?? true),
    parentId: row.parent_id || null,
  };
}

export function mapProductFromDb(row: any): Product {
  const nutrition = typeof row.nutrition_facts === "string"
    ? JSON.parse(row.nutrition_facts)
    : (row.nutrition_facts || {
        servingSize: "30 g (1 scoop)",
        servingsPerContainer: 33,
        rows: [
          { nutrient: "Valor Energético", amountPerServing: "120 kcal", dailyValuePct: "6%" },
          { nutrient: "Proteínas Puras", amountPerServing: "25 g", dailyValuePct: "50%" },
          { nutrient: "Carbohidratos", amountPerServing: "1.5 g", dailyValuePct: "1%" },
          { nutrient: "Grasas Totales", amountPerServing: "1.2 g", dailyValuePct: "2%" },
        ],
        ingredients: "Proteína de suero de máxima pureza, saborizante natural y stevia.",
        allergens: "Contiene derivados lácteos. Libre de gluten (Sin TACC).",
      });

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    brand: row.brand || "Vital Sur Lab",
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id || undefined,
    shortDescription: row.short_description || "",
    description: row.description || "",
    usageInstructions: row.usage_instructions || "",
    price: Number(row.price),
    salePrice: row.sale_price !== null && row.sale_price !== undefined ? Number(row.sale_price) : null,
    cost: Number(row.cost || 0),
    stock: Number(row.stock || 0),
    minStock: Number(row.min_stock || 5),
    active: Boolean(row.active ?? true),
    featured: Boolean(row.featured ?? false),
    flavors: Array.isArray(row.flavors) ? row.flavors : (row.flavors ? JSON.parse(row.flavors) : ["Clásico"]),
    sizes: Array.isArray(row.sizes) ? row.sizes : (row.sizes ? JSON.parse(row.sizes) : ["Estándar"]),
    nutritionFacts: nutrition,
    illustrationType: row.illustration_type || "whey-jar",
    accentColor: row.accent_color || "#2E9E6B",
    badgeText: row.badge_text || undefined,
    soldCount: Number(row.sold_count || 0),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapOrderFromDb(orderRow: any, items: any[] = []): Order {
  return {
    id: orderRow.id,
    orderNumber: orderRow.order_number,
    status: orderRow.status,
    paymentMethod: orderRow.payment_method,
    paymentReference: orderRow.payment_reference || undefined,
    subtotal: Number(orderRow.subtotal),
    discount: Number(orderRow.discount || 0),
    couponCode: orderRow.coupon_code || null,
    shippingCost: Number(orderRow.shipping_cost || 0),
    total: Number(orderRow.total),
    estimatedCost: Number(orderRow.estimated_cost || 0),
    trackingNumber: orderRow.tracking_number || null,
    internalNotes: orderRow.internal_notes || "",
    customerId: orderRow.customer_id,
    customerName: orderRow.customer_name,
    customerEmail: orderRow.customer_email,
    customerPhone: orderRow.customer_phone,
    customerDni: orderRow.customer_dni,
    shippingAddress: orderRow.shipping_address,
    shippingCity: orderRow.shipping_city,
    shippingProvince: orderRow.shipping_province,
    shippingPostalCode: orderRow.shipping_postal_code,
    shippingNotes: orderRow.shipping_notes || undefined,
    isUnread: Boolean(orderRow.is_unread ?? false),
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      sku: item.sku,
      productName: item.product_name,
      flavor: item.flavor || "Clásico",
      size: item.size || "Estándar",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      unitCost: Number(item.unit_cost || 0),
    })),
    createdAt: orderRow.created_at || new Date().toISOString(),
    updatedAt: orderRow.updated_at || new Date().toISOString(),
  };
}

export function mapCustomerFromDb(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    dni: row.dni || "",
    address: row.address || "",
    city: row.city || "",
    province: row.province || "",
    postalCode: row.postal_code || "",
    totalSpent: Number(row.total_spent || 0),
    ordersCount: Number(row.orders_count || 0),
    tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags) : []),
    notes: row.notes || "",
    createdAt: row.created_at || new Date().toISOString(),
    lastOrderAt: row.last_order_at || row.created_at || new Date().toISOString(),
  };
}

export function mapStockMovementFromDb(row: any): StockMovement {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku,
    type: row.type,
    quantity: Number(row.quantity),
    previousStock: Number(row.previous_stock),
    newStock: Number(row.new_stock),
    reason: row.reason || "",
    createdBy: row.created_by || "Admin",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapCouponFromDb(row: any): Coupon {
  return {
    id: row.id,
    code: row.code,
    description: row.description || "",
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minPurchase: Number(row.min_purchase || 0),
    maxUses: Number(row.max_uses || 100),
    usedCount: Number(row.used_count || 0),
    expiresAt: row.expires_at || "",
    active: Boolean(row.active ?? true),
  };
}

export function mapStoreSettingsFromDb(row: any, fallback: StoreSettings): StoreSettings {
  if (!row) return fallback;
  return {
    storeName: row.store_name || fallback.storeName,
    tagline: row.tagline || fallback.tagline,
    address: row.address || fallback.address,
    phone: row.phone || fallback.phone,
    whatsappNumber: row.whatsapp_number || fallback.whatsappNumber,
    email: row.email || fallback.email,
    instagram: row.instagram || fallback.instagram,
    facebook: row.facebook || fallback.facebook,
    shippingCost: Number(row.shipping_cost ?? fallback.shippingCost),
    freeShippingThreshold: Number(row.free_shipping_threshold ?? fallback.freeShippingThreshold),
    shippingCarrier: row.shipping_carrier || fallback.shippingCarrier,
    promoBannerText: row.promo_banner_text || fallback.promoBannerText,
    heroTitle: row.hero_title || fallback.heroTitle,
    heroSubtitle: row.hero_subtitle || fallback.heroSubtitle,
    mpEnabled: Boolean(row.mp_enabled ?? fallback.mpEnabled),
    mpPublicKey: row.mp_public_key || fallback.mpPublicKey,
    transferEnabled: Boolean(row.transfer_enabled ?? fallback.transferEnabled),
    transferDiscountPct: Number(row.transfer_discount_pct ?? fallback.transferDiscountPct),
    bankAlias: row.bank_alias || fallback.bankAlias,
    bankCbu: row.bank_cbu || fallback.bankCbu,
    bankHolder: row.bank_holder || fallback.bankHolder,
  };
}

// -------------------------------------------------------------
// Mappers: Convierte de TypeScript camelCase a Postgres snake_case
// -------------------------------------------------------------

export function mapProductToDb(p: Product) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    brand: p.brand || "Vital Sur Lab",
    category_id: p.categoryId,
    subcategory_id: p.subcategoryId || null,
    short_description: p.shortDescription || "",
    description: p.description || "",
    usage_instructions: p.usageInstructions || "",
    price: p.price,
    sale_price: p.salePrice !== undefined ? p.salePrice : null,
    cost: p.cost || 0,
    stock: p.stock || 0,
    min_stock: p.minStock || 5,
    active: p.active ?? true,
    featured: p.featured ?? false,
    flavors: p.flavors || ["Clásico"],
    sizes: p.sizes || ["Estándar"],
    nutrition_facts: p.nutritionFacts || {},
    illustration_type: p.illustrationType || "whey-jar",
    accent_color: p.accentColor || "#2E9E6B",
    sold_count: p.soldCount || 0,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function mapOrderToDb(o: Order) {
  return {
    id: o.id,
    order_number: o.orderNumber,
    status: o.status,
    payment_method: o.paymentMethod,
    payment_reference: o.paymentReference || null,
    subtotal: o.subtotal,
    discount: o.discount || 0,
    coupon_code: o.couponCode || null,
    shipping_cost: o.shippingCost,
    total: o.total,
    estimated_cost: o.estimatedCost || 0,
    tracking_number: o.trackingNumber || null,
    internal_notes: o.internalNotes || "",
    customer_id: o.customerId || null,
    customer_name: o.customerName,
    customer_email: o.customerEmail,
    customer_phone: o.customerPhone,
    customer_dni: o.customerDni,
    shipping_address: o.shippingAddress,
    shipping_city: o.shippingCity,
    shipping_province: o.shippingProvince,
    shipping_postal_code: o.shippingPostalCode,
    shipping_notes: o.shippingNotes || null,
    is_unread: o.isUnread ?? true,
    created_at: o.createdAt || new Date().toISOString(),
    updated_at: o.updatedAt || new Date().toISOString(),
  };
}

export function mapOrderItemToDb(item: any, orderId: string) {
  return {
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    order_id: orderId,
    product_id: item.productId || null,
    sku: item.sku,
    product_name: item.productName || item.name || "Suplemento Vital Sur",
    flavor: item.flavor || "Clásico",
    size: item.size || "Estándar",
    quantity: item.quantity,
    unit_price: item.unitPrice,
    unit_cost: item.unitCost || 0,
  };
}

export function mapCustomerToDb(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    dni: c.dni || "",
    address: c.address || "",
    city: c.city || "",
    province: c.province || "",
    postal_code: c.postalCode || "",
    total_spent: c.totalSpent || 0,
    orders_count: c.ordersCount || 0,
    notes: c.notes || "",
    tags: c.tags || [],
    created_at: c.createdAt || new Date().toISOString(),
    last_order_at: c.lastOrderAt || new Date().toISOString(),
  };
}

export function mapStockMovementToDb(m: StockMovement) {
  return {
    id: m.id,
    product_id: m.productId,
    product_name: m.productName,
    sku: m.sku,
    type: m.type,
    quantity: m.quantity,
    previous_stock: m.previousStock,
    new_stock: m.newStock,
    reason: m.reason || "",
    created_by: m.createdBy || "Admin",
    created_at: m.createdAt || new Date().toISOString(),
  };
}

export function mapCouponToDb(c: Coupon) {
  return {
    id: c.id,
    code: c.code,
    description: c.description || "",
    discount_type: c.discountType,
    discount_value: c.discountValue,
    min_purchase: c.minPurchase || 0,
    max_uses: c.maxUses || 100,
    used_count: c.usedCount || 0,
    expires_at: c.expiresAt || "",
    active: c.active ?? true,
    created_at: new Date().toISOString(),
  };
}

