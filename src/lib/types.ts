export type UserRole = "ADMIN" | "COLLABORATOR";

export type OrderStatus =
  | "nuevo"
  | "pago_pendiente"
  | "pagado"
  | "en_preparacion"
  | "despachado"
  | "entregado"
  | "cancelado";

export type PaymentMethod = "mercado_pago" | "transferencia";

export type CategoryIconName =
  | "dumbbell"
  | "zap"
  | "flame"
  | "shield-plus"
  | "activity"
  | "heart-pulse"
  | "cup-soda"
  | "leaf"
  | "sparkles"
  | "package";

export type IllustrationType =
  | "whey-jar"
  | "creatine-tub"
  | "bcaa-powder"
  | "preworkout-tub"
  | "vitamin-bottle"
  | "burner-bottle"
  | "shaker-cup"
  | "straps-gear"
  | "omega-bottle"
  | "magnesium-bottle"
  | "collagen-jar"
  | "combo-pack";

export interface NutritionRow {
  nutrient: string;
  amountPerServing: string;
  dailyValuePct: string;
}

export interface NutritionFacts {
  servingSize: string;
  servingsPerContainer: number;
  rows: NutritionRow[];
  ingredients: string;
  allergens: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: CategoryIconName;
  order: number;
  active: boolean;
  parentId: string | null;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  subcategoryId?: string;
  shortDescription: string;
  description: string;
  usageInstructions: string;
  price: number;
  salePrice: number | null;
  cost: number;
  stock: number;
  minStock: number;
  active: boolean;
  featured: boolean;
  flavors: string[];
  sizes: string[];
  nutritionFacts: NutritionFacts;
  illustrationType: IllustrationType;
  accentColor: string;
  badgeText?: string;
  soldCount: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  unitPrice: number;
  originalPrice: number;
  unitCost: number;
  quantity: number;
  flavor: string;
  size: string;
  stock: number;
  illustrationType: IllustrationType;
  accentColor: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  flavor: string;
  size: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingCost: number;
  total: number;
  estimatedCost: number;
  trackingNumber: string;
  internalNotes: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingNotes: string;
  isUnread: boolean;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  totalSpent: number;
  ordersCount: number;
  notes: string;
  tags: string[];
  createdAt: string;
  lastOrderAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: "ENTRADA" | "SALIDA_VENTA" | "AJUSTE_MANUAL";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  instagram: string;
  facebook: string;
  shippingCost: number;
  freeShippingThreshold: number;
  shippingCarrier: string;
  promoBannerText: string;
  heroTitle: string;
  heroSubtitle: string;
  mpEnabled: boolean;
  mpPublicKey: string;
  transferEnabled: boolean;
  transferDiscountPct: number;
  bankAlias: string;
  bankCbu: string;
  bankHolder: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
}

export interface DatabaseState {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  stockMovements: StockMovement[];
  coupons: Coupon[];
}

