"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  DatabaseState,
  CartItem,
  Product,
  Category,
  Order,
  OrderStatus,
  PaymentMethod,
  Customer,
  StockMovement,
  Coupon,
  StoreSettings,
  StaffUser,
} from "@/lib/types";
import { INITIAL_DB_STATE } from "@/lib/initial-data";
import { calculateShipping, ShippingCalculation } from "@/lib/format";

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  shippingNotes: string;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  initialStatus?: OrderStatus;
}

interface ToastAlert {
  id: string;
  title: string;
  description?: string;
  type: "success" | "info" | "warning";
}

interface VitalSurContextValue {
  db: DatabaseState;
  isHydrated: boolean;
  // Carrito
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  appliedCoupon: Coupon | null;
  shippingInfo: ShippingCalculation;
  cartTotal: number;
  lastAddedItemName: string | null;
  addToCart: (
    product: Product,
    quantity?: number,
    flavor?: string,
    size?: string,
    openDrawer?: boolean
  ) => void;
  removeFromCart: (productId: string, flavor: string, size: string) => void;
  updateCartQuantity: (
    productId: string,
    flavor: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  // Checkout
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  // Autenticación CRM
  currentUser: StaffUser | null;
  loginStaff: (email: string, password: string) => { ok: boolean; message: string };
  quickLoginRole: (role: "ADMIN" | "COLLABORATOR") => void;
  logoutStaff: () => void;
  // Acciones CRM
  unreadOrdersCount: number;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderTrackingAndNotes: (
    orderId: string,
    trackingNumber: string,
    internalNotes: string
  ) => Promise<void>;
  markOrderAsRead: (orderId: string) => Promise<void>;
  markAllOrdersAsRead: () => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  importProductsBatch: (newProducts: Product[]) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategory: (categoryId: string, direction: "up" | "down") => Promise<void>;
  updateCustomerDetails: (
    customerId: string,
    notes: string,
    tags: string[]
  ) => Promise<void>;
  adjustProductStock: (
    productId: string,
    quantityDelta: number,
    reason: string
  ) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  updateStoreSettings: (settings: StoreSettings) => Promise<void>;
  simulateIncomingRealtimeOrder: () => Promise<Order>;
  resetDemoDatabase: () => Promise<void>;
  // Notificaciones visuales
  toast: ToastAlert | null;
  showToast: (title: string, description?: string, type?: "success" | "info" | "warning") => void;
  dismissToast: () => void;
}

const VitalSurContext = createContext<VitalSurContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "vital_sur_cart_v1";
const COUPON_STORAGE_KEY = "vital_sur_coupon_v1";
const STAFF_STORAGE_KEY = "vital_sur_staff_session_v1";

export const DEMO_STAFF_USERS: Record<string, StaffUser & { password: string }> = {
  "admin@vitalsur.com.ar": {
    id: "staff-admin",
    name: "Martín Morales",
    email: "admin@vitalsur.com.ar",
    role: "ADMIN",
    roleLabel: "Administrador General",
    password: "admin123",
  },
  "colaborador@vitalsur.com.ar": {
    id: "staff-colab",
    name: "Sofía Duarte",
    email: "colaborador@vitalsur.com.ar",
    role: "COLLABORATOR",
    roleLabel: "Colaboradora (Despacho y Stock)",
    password: "varela123",
  },
};

export function VitalSurProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DatabaseState>(INITIAL_DB_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [lastAddedItemName, setLastAddedItemName] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastAlert | null>(null);

  const showToast = useCallback(
    (
      title: string,
      description?: string,
      type: "success" | "info" | "warning" = "success"
    ) => {
      const id = String(Date.now());
      setToast({ id, title, description, type });
    },
    []
  );

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Carga inicial desde servidor y localStorage
  const fetchServerDb = useCallback(async () => {
    try {
      const res = await fetch("/api/store", { cache: "no-store" });
      if (res.ok) {
        const serverState = (await res.json()) as DatabaseState;
        if (serverState && serverState.products) {
          setDb(serverState);
        }
      }
    } catch (err) {
      console.error("Error sincronizando estado inicial:", err);
    }
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedStaff = localStorage.getItem(STAFF_STORAGE_KEY);
      if (savedStaff) {
        setCurrentUser(JSON.parse(savedStaff));
      }
    } catch {
      // Ignorar errores de parseo en almacenamiento local
    }
    fetchServerDb().finally(() => setIsHydrated(true));
  }, [fetchServerDb]);

  // Persistencia de carrito entre sesiones
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignorar
    }
  }, [cart, isHydrated]);

  // Sincronización en tiempo real entre pestañas (Tienda <-> CRM)
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("vital_sur_realtime");
    channel.onmessage = (event) => {
      if (event.data?.type === "DB_UPDATED" && event.data?.payload) {
        setDb(event.data.payload);
        if (event.data?.orderCreated) {
          showToast(
            `Nuevo pedido recibido: ${event.data.orderNumber}`,
            "El pedido ingresó en tiempo real al listado de administración.",
            "info"
          );
        }
      }
    };
    return () => channel.close();
  }, [showToast]);

  const persistState = useCallback(
    async (nextState: DatabaseState, orderCreatedNumber?: string) => {
      setDb(nextState);
      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const channel = new BroadcastChannel("vital_sur_realtime");
          channel.postMessage({
            type: "DB_UPDATED",
            payload: nextState,
            orderCreated: Boolean(orderCreatedNumber),
            orderNumber: orderCreatedNumber,
          });
          channel.close();
        }
        await fetch("/api/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: nextState }),
        });
      } catch (err) {
        console.error("Error guardando en servidor:", err);
      }
    },
    []
  );

  // Cálculos del carrito y envíos
  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal <= 0) return 0;
    if (cartSubtotal < appliedCoupon.minPurchase) return 0;
    if (appliedCoupon.discountType === "PERCENTAGE") {
      return Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    }
    return Math.min(cartSubtotal, appliedCoupon.discountValue);
  }, [appliedCoupon, cartSubtotal]);

  const shippingInfo = useMemo(
    () =>
      calculateShipping(
        cartSubtotal,
        db.settings.shippingCost,
        db.settings.freeShippingThreshold
      ),
    [cartSubtotal, db.settings.shippingCost, db.settings.freeShippingThreshold]
  );

  const cartTotal = useMemo(() => {
    if (cartSubtotal <= 0) return 0;
    return Math.max(0, cartSubtotal - cartDiscount + shippingInfo.shippingCost);
  }, [cartSubtotal, cartDiscount, shippingInfo.shippingCost]);

  // Operaciones del Carrito
  const addToCart = useCallback(
    (
      product: Product,
      quantity: number = 1,
      flavor?: string,
      size?: string,
      openDrawer: boolean = true
    ) => {
      const selectedFlavor = flavor || product.flavors[0] || "Clásico";
      const selectedSize = size || product.sizes[0] || "Estándar";
      const unitPrice = product.salePrice ?? product.price;

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === product.id &&
            item.flavor === selectedFlavor &&
            item.size === selectedSize
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          const nextQty = Math.min(
            product.stock,
            updated[existingIndex].quantity + quantity
          );
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: nextQty,
            unitPrice,
          };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            slug: product.slug,
            brand: product.brand,
            unitPrice,
            originalPrice: product.price,
            unitCost: product.cost,
            quantity: Math.min(product.stock, quantity),
            flavor: selectedFlavor,
            size: selectedSize,
            stock: product.stock,
            illustrationType: product.illustrationType,
            accentColor: product.accentColor,
          },
        ];
      });

      setLastAddedItemName(product.name);
      setTimeout(() => setLastAddedItemName(null), 1600);

      if (openDrawer) {
        setIsCartOpen(true);
      } else {
        showToast("Producto agregado al carrito", `${product.name} (${selectedFlavor})`);
      }
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: string, flavor: string, size: string) => {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(
              item.productId === productId &&
              item.flavor === flavor &&
              item.size === size
            )
        )
      );
    },
    []
  );

  const updateCartQuantity = useCallback(
    (productId: string, flavor: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, flavor, size);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId &&
          item.flavor === flavor &&
          item.size === size
            ? { ...item, quantity: Math.min(item.stock, quantity) }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // Ignorar
    }
  }, []);

  const applyCouponCode = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        return { ok: false, message: "Ingresá un código de cupón válido." };
      }
      const found = db.coupons.find(
        (c) => c.code.toUpperCase() === normalized && c.active
      );
      if (!found) {
        return {
          ok: false,
          message: "El cupón ingresado no existe o no está activo.",
        };
      }
      if (found.usedCount >= found.maxUses) {
        return {
          ok: false,
          message: "Este cupón ya alcanzó su límite máximo de usos.",
        };
      }
      if (cartSubtotal < found.minPurchase) {
        return {
          ok: false,
          message: `Este cupón requiere una compra mínima de $${found.minPurchase.toLocaleString("es-AR")}.`,
        };
      }
      setAppliedCoupon(found);
      return {
        ok: true,
        message: `Cupón ${found.code} aplicado correctamente.`,
      };
    },
    [db.coupons, cartSubtotal]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // Creación de Pedido (Checkout -> CRM en tiempo real)
  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<Order> => {
      const nextNumber = 1001 + db.orders.length;
      const orderNumber = `VS-${nextNumber}`;
      const now = new Date().toISOString();

      const orderItems = cart.map((item, idx) => ({
        id: `oi-${Date.now()}-${idx}`,
        productId: item.productId,
        sku: item.sku,
        productName: item.name,
        flavor: item.flavor,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost,
      }));

      const estimatedCost = orderItems.reduce(
        (acc, i) => acc + i.unitCost * i.quantity,
        0
      );

      // Buscar o crear cliente
      const existingCustomer = db.customers.find(
        (c) => c.email.toLowerCase() === input.customerEmail.toLowerCase()
      );
      const customerId = existingCustomer
        ? existingCustomer.id
        : `cust-${Date.now()}`;

      const updatedCustomers: Customer[] = existingCustomer
        ? db.customers.map((c) =>
            c.id === existingCustomer.id
              ? {
                  ...c,
                  name: input.customerName,
                  phone: input.customerPhone,
                  dni: input.customerDni,
                  address: input.shippingAddress,
                  city: input.shippingCity,
                  province: input.shippingProvince,
                  postalCode: input.shippingPostalCode,
                  totalSpent: c.totalSpent + cartTotal,
                  ordersCount: c.ordersCount + 1,
                  lastOrderAt: now,
                }
              : c
          )
        : [
            {
              id: customerId,
              name: input.customerName,
              email: input.customerEmail,
              phone: input.customerPhone,
              dni: input.customerDni,
              address: input.shippingAddress,
              city: input.shippingCity,
              province: input.shippingProvince,
              postalCode: input.shippingPostalCode,
              totalSpent: cartTotal,
              ordersCount: 1,
              notes: "Cliente registrado desde la tienda online.",
              tags: ["Tienda Web", input.shippingCity],
              createdAt: now,
              lastOrderAt: now,
            },
            ...db.customers,
          ];

      // Descontar stock y registrar movimientos de inventario
      const newMovements: StockMovement[] = [];
      const updatedProducts = db.products.map((product) => {
        const boughtQty = cart
          .filter((c) => c.productId === product.id)
          .reduce((acc, c) => acc + c.quantity, 0);

        if (boughtQty <= 0) return product;

        const nextStock = Math.max(0, product.stock - boughtQty);
        newMovements.push({
          id: `mov-${Date.now()}-${product.id}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: "SALIDA_VENTA",
          quantity: -boughtQty,
          previousStock: product.stock,
          newStock: nextStock,
          reason: `Venta tienda online - Pedido #${orderNumber}`,
          createdBy: "Checkout Web",
          createdAt: now,
        });

        return {
          ...product,
          stock: nextStock,
          soldCount: (product.soldCount || 0) + boughtQty,
        };
      });

      // Actualizar contador de cupón si aplica
      const updatedCoupons = appliedCoupon
        ? db.coupons.map((c) =>
            c.id === appliedCoupon.id
              ? { ...c, usedCount: c.usedCount + 1 }
              : c
          )
        : db.coupons;

      const defaultStatus: OrderStatus =
        input.initialStatus ||
        (input.paymentMethod === "mercado_pago" ? "pagado" : "pago_pendiente");

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        status: defaultStatus,
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        couponCode: appliedCoupon?.code || null,
        shippingCost: shippingInfo.shippingCost,
        total: cartTotal,
        estimatedCost,
        trackingNumber: "",
        internalNotes: "",
        customerId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        customerDni: input.customerDni,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingProvince: input.shippingProvince,
        shippingPostalCode: input.shippingPostalCode,
        shippingNotes: input.shippingNotes,
        isUnread: true,
        items: orderItems,
        createdAt: now,
        updatedAt: now,
      };

      const nextDb: DatabaseState = {
        ...db,
        products: updatedProducts,
        customers: updatedCustomers,
        orders: [newOrder, ...db.orders],
        stockMovements: [...newMovements, ...db.stockMovements],
        coupons: updatedCoupons,
      };

      await persistState(nextDb, orderNumber);
      clearCart();
      return newOrder;
    },
    [
      db,
      cart,
      cartSubtotal,
      cartDiscount,
      cartTotal,
      shippingInfo.shippingCost,
      appliedCoupon,
      persistState,
      clearCart,
    ]
  );

  // Autenticación del CRM
  const loginStaff = useCallback(
    (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      const matched = DEMO_STAFF_USERS[normalized];
      if (!matched || matched.password !== password) {
        return {
          ok: false,
          message:
            "Credenciales inválidas. Verificá tu correo y contraseña o usá el acceso rápido de prueba.",
        };
      }
      const userObj: StaffUser = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        roleLabel: matched.roleLabel,
      };
      setCurrentUser(userObj);
      try {
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(userObj));
      } catch {
        // Ignorar
      }
      showToast(`Hola de nuevo, ${userObj.name}`, `Sesión iniciada como ${userObj.roleLabel}`);
      return { ok: true, message: "Ingreso exitoso" };
    },
    [showToast]
  );

  const quickLoginRole = useCallback(
    (role: "ADMIN" | "COLLABORATOR") => {
      const target =
        role === "ADMIN"
          ? DEMO_STAFF_USERS["admin@vitalsur.com.ar"]
          : DEMO_STAFF_USERS["colaborador@vitalsur.com.ar"];
      const userObj: StaffUser = {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
        roleLabel: target.roleLabel,
      };
      setCurrentUser(userObj);
      try {
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(userObj));
      } catch {
        // Ignorar
      }
      showToast(`Acceso activo: ${userObj.name}`, userObj.roleLabel);
    },
    [showToast]
  );

  const logoutStaff = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STAFF_STORAGE_KEY);
    } catch {
      // Ignorar
    }
  }, []);

  // Acciones de gestión CRM
  const unreadOrdersCount = useMemo(
    () => db.orders.filter((o) => o.isUnread).length,
    [db.orders]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const now = new Date().toISOString();
      const nextDb: DatabaseState = {
        ...db,
        orders: db.orders.map((o) =>
          o.id === orderId ? { ...o, status, isUnread: false, updatedAt: now } : o
        ),
      };
      await persistState(nextDb);
      showToast("Estado de pedido actualizado", `El pedido pasó a estado: ${status.replace("_", " ").toUpperCase()}`);
    },
    [db, persistState, showToast]
  );

  const updateOrderTrackingAndNotes = useCallback(
    async (orderId: string, trackingNumber: string, internalNotes: string) => {
      const now = new Date().toISOString();
      const nextDb: DatabaseState = {
        ...db,
        orders: db.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                trackingNumber: trackingNumber.trim().toUpperCase(),
                internalNotes,
                isUnread: false,
                updatedAt: now,
              }
            : o
        ),
      };
      await persistState(nextDb);
      showToast(
        "Seguimiento y notas guardados",
        trackingNumber
          ? `Código Correo Argentino: ${trackingNumber.toUpperCase()}`
          : "Notas internas actualizadas"
      );
    },
    [db, persistState, showToast]
  );

  const markOrderAsRead = useCallback(
    async (orderId: string) => {
      const target = db.orders.find((o) => o.id === orderId);
      if (!target || !target.isUnread) return;
      const nextDb: DatabaseState = {
        ...db,
        orders: db.orders.map((o) =>
          o.id === orderId ? { ...o, isUnread: false } : o
        ),
      };
      await persistState(nextDb);
    },
    [db, persistState]
  );

  const markAllOrdersAsRead = useCallback(async () => {
    const nextDb: DatabaseState = {
      ...db,
      orders: db.orders.map((o) => ({ ...o, isUnread: false })),
    };
    await persistState(nextDb);
    showToast("Notificaciones al día", "Todos los pedidos fueron marcados como revisados.");
  }, [db, persistState, showToast]);

  const saveProduct = useCallback(
    async (product: Product) => {
      const exists = db.products.some((p) => p.id === product.id);
      const nextProducts = exists
        ? db.products.map((p) => (p.id === product.id ? product : p))
        : [product, ...db.products];
      await persistState({ ...db, products: nextProducts });
      showToast(
        exists ? "Producto actualizado" : "Producto creado",
        `${product.name} (${product.sku})`
      );
    },
    [db, persistState, showToast]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      const target = db.products.find((p) => p.id === productId);
      await persistState({
        ...db,
        products: db.products.filter((p) => p.id !== productId),
      });
      showToast("Producto eliminado", target?.name || "");
    },
    [db, persistState, showToast]
  );

  const importProductsBatch = useCallback(
    async (newProducts: Product[]) => {
      const merged = [...db.products];
      for (const incoming of newProducts) {
        const idx = merged.findIndex(
          (p) => p.sku.toLowerCase() === incoming.sku.toLowerCase()
        );
        if (idx > -1) {
          merged[idx] = { ...merged[idx], ...incoming, id: merged[idx].id };
        } else {
          merged.unshift(incoming);
        }
      }
      await persistState({ ...db, products: merged });
      showToast(
        "Importación CSV completada",
        `Se procesaron ${newProducts.length} productos correctamente.`
      );
    },
    [db, persistState, showToast]
  );

  const saveCategory = useCallback(
    async (category: Category) => {
      const exists = db.categories.some((c) => c.id === category.id);
      const nextCategories = exists
        ? db.categories.map((c) => (c.id === category.id ? category : c))
        : [...db.categories, category];
      await persistState({ ...db, categories: nextCategories });
      showToast(
        exists ? "Categoría actualizada" : "Categoría creada",
        category.name
      );
    },
    [db, persistState, showToast]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      await persistState({
        ...db,
        categories: db.categories.filter(
          (c) => c.id !== categoryId && c.parentId !== categoryId
        ),
      });
      showToast("Categoría eliminada");
    },
    [db, persistState, showToast]
  );

  const reorderCategory = useCallback(
    async (categoryId: string, direction: "up" | "down") => {
      const target = db.categories.find((c) => c.id === categoryId);
      if (!target) return;
      const siblings = db.categories
        .filter((c) => c.parentId === target.parentId)
        .sort((a, b) => a.order - b.order);
      const idx = siblings.findIndex((c) => c.id === categoryId);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= siblings.length) return;

      const currentOrder = siblings[idx].order;
      const neighborOrder = siblings[swapIdx].order;

      const nextCategories = db.categories.map((c) => {
        if (c.id === siblings[idx].id) return { ...c, order: neighborOrder };
        if (c.id === siblings[swapIdx].id) return { ...c, order: currentOrder };
        return c;
      });
      await persistState({ ...db, categories: nextCategories });
    },
    [db, persistState]
  );

  const updateCustomerDetails = useCallback(
    async (customerId: string, notes: string, tags: string[]) => {
      const nextCustomers = db.customers.map((c) =>
        c.id === customerId ? { ...c, notes, tags } : c
      );
      await persistState({ ...db, customers: nextCustomers });
      showToast("Ficha de cliente actualizada");
    },
    [db, persistState, showToast]
  );

  const adjustProductStock = useCallback(
    async (productId: string, quantityDelta: number, reason: string) => {
      const product = db.products.find((p) => p.id === productId);
      if (!product || quantityDelta === 0) return;

      const nextStock = Math.max(0, product.stock + quantityDelta);
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        type: quantityDelta > 0 ? "ENTRADA" : "AJUSTE_MANUAL",
        quantity: quantityDelta,
        previousStock: product.stock,
        newStock: nextStock,
        reason: reason || "Ajuste manual desde panel de inventario",
        createdBy: currentUser
          ? `${currentUser.name} (${currentUser.role})`
          : "Administración",
        createdAt: new Date().toISOString(),
      };

      const nextProducts = db.products.map((p) =>
        p.id === productId ? { ...p, stock: nextStock } : p
      );

      await persistState({
        ...db,
        products: nextProducts,
        stockMovements: [movement, ...db.stockMovements],
      });
      showToast(
        "Stock actualizado",
        `${product.name}: ${product.stock} -> ${nextStock} unidades`
      );
    },
    [db, currentUser, persistState, showToast]
  );

  const saveCoupon = useCallback(
    async (coupon: Coupon) => {
      const exists = db.coupons.some((c) => c.id === coupon.id);
      const nextCoupons = exists
        ? db.coupons.map((c) => (c.id === coupon.id ? coupon : c))
        : [coupon, ...db.coupons];
      await persistState({ ...db, coupons: nextCoupons });
      showToast(
        exists ? "Cupón actualizado" : "Cupón creado",
        `Código: ${coupon.code}`
      );
    },
    [db, persistState, showToast]
  );

  const deleteCoupon = useCallback(
    async (couponId: string) => {
      await persistState({
        ...db,
        coupons: db.coupons.filter((c) => c.id !== couponId),
      });
      showToast("Cupón eliminado");
    },
    [db, persistState, showToast]
  );

  const updateStoreSettings = useCallback(
    async (settings: StoreSettings) => {
      await persistState({ ...db, settings });
      showToast(
        "Configuración guardada",
        `Envío fijo $${settings.shippingCost.toLocaleString("es-AR")} | Gratis desde $${settings.freeShippingThreshold.toLocaleString("es-AR")}`
      );
    },
    [db, persistState, showToast]
  );

  const simulateIncomingRealtimeOrder = useCallback(async (): Promise<Order> => {
    const nextNumber = 1001 + db.orders.length;
    const orderNumber = `VS-${nextNumber}`;
    const now = new Date().toISOString();

    const sampleProduct = db.products[0] || {
      id: "prod-sim-1",
      sku: "VS-SIM-01",
      name: "Proteína Whey 100% Pura",
      slug: "proteina-whey-pura",
      brand: "Vital Sur Lab",
      categoryId: "cat-proteinas",
      shortDescription: "Fórmula pura",
      description: "Fórmula pura",
      usageInstructions: "1 scoop",
      price: 45000,
      salePrice: null,
      cost: 24000,
      stock: 50,
      minStock: 10,
      active: true,
      featured: true,
      flavors: ["Chocolate Suizo"],
      sizes: ["1 kg"],
      nutritionFacts: {
        servingSize: "30 g (1 scoop)",
        servingsPerContainer: 33,
        rows: [
          { nutrient: "Valor Energético", amountPerServing: "120 kcal", dailyValuePct: "6%" },
          { nutrient: "Proteínas Puras", amountPerServing: "25 g", dailyValuePct: "50%" },
        ],
        ingredients: "Proteína aislada de suero lácteo y cacao amargo.",
        allergens: "Contiene derivados lácteos. Libre de gluten (Sin TACC).",
      },
      illustrationType: "whey-jar" as const,
      accentColor: "#2E9E6B",
      soldCount: 1,
      createdAt: now,
    };

    const p1Price = sampleProduct.salePrice ?? sampleProduct.price;
    const subtotal = p1Price;
    const calc = calculateShipping(
      subtotal,
      db.settings.shippingCost,
      db.settings.freeShippingThreshold
    );

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      status: "nuevo",
      paymentMethod: "mercado_pago",
      paymentReference: `MP-TEST-${Math.floor(10000000 + Math.random() * 90000000)}`,
      subtotal,
      discount: 0,
      couponCode: null,
      shippingCost: calc.shippingCost,
      total: subtotal + calc.shippingCost,
      estimatedCost: sampleProduct.cost,
      trackingNumber: "",
      internalNotes: "Pedido recibido en tiempo real desde la tienda online.",
      customerId: "cust-1",
      customerName: "Agustín Fernández (Tiempo Real)",
      customerEmail: "agustin.fernandez.sur@gmail.com",
      customerPhone: "+54 9 11 5982-3314",
      customerDni: "42.190.445",
      shippingAddress: "Av. Eva Perón 1840",
      shippingCity: "Florencio Varela",
      shippingProvince: "Buenos Aires (GBA Sur)",
      shippingPostalCode: "1888",
      shippingNotes: "Frente a la estación.",
      isUnread: true,
      items: [
        {
          id: `sim-1-${Date.now()}`,
          productId: sampleProduct.id,
          sku: sampleProduct.sku,
          productName: sampleProduct.name,
          flavor: sampleProduct.flavors[0] || "Clásico",
          size: sampleProduct.sizes[0] || "Estándar",
          quantity: 1,
          unitPrice: p1Price,
          unitCost: sampleProduct.cost,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const nextDb: DatabaseState = {
      ...db,
      orders: [newOrder, ...db.orders],
    };

    await persistState(nextDb, orderNumber);
    showToast(
      `Nuevo pedido en tiempo real: #${orderNumber}`,
      `${newOrder.customerName} — Total $${newOrder.total.toLocaleString("es-AR")}`,
      "info"
    );
    return newOrder;
  }, [db, persistState, showToast]);

  const resetDemoDatabase = useCallback(async () => {
    setDb(INITIAL_DB_STATE);
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RESET_DEMO" }),
    });
    showToast("Datos de demostración restaurados");
  }, [showToast]);

  const value = useMemo(
    () => ({
      db,
      isHydrated,
      cart,
      isCartOpen,
      setIsCartOpen,
      cartCount,
      cartSubtotal,
      cartDiscount,
      appliedCoupon,
      shippingInfo,
      cartTotal,
      lastAddedItemName,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      applyCouponCode,
      removeCoupon,
      createOrder,
      currentUser,
      loginStaff,
      quickLoginRole,
      logoutStaff,
      unreadOrdersCount,
      updateOrderStatus,
      updateOrderTrackingAndNotes,
      markOrderAsRead,
      markAllOrdersAsRead,
      saveProduct,
      deleteProduct,
      importProductsBatch,
      saveCategory,
      deleteCategory,
      reorderCategory,
      updateCustomerDetails,
      adjustProductStock,
      saveCoupon,
      deleteCoupon,
      updateStoreSettings,
      simulateIncomingRealtimeOrder,
      resetDemoDatabase,
      toast,
      showToast,
      dismissToast,
    }),
    [
      db,
      isHydrated,
      cart,
      isCartOpen,
      cartCount,
      cartSubtotal,
      cartDiscount,
      appliedCoupon,
      shippingInfo,
      cartTotal,
      lastAddedItemName,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      applyCouponCode,
      removeCoupon,
      createOrder,
      currentUser,
      loginStaff,
      quickLoginRole,
      logoutStaff,
      unreadOrdersCount,
      updateOrderStatus,
      updateOrderTrackingAndNotes,
      markOrderAsRead,
      markAllOrdersAsRead,
      saveProduct,
      deleteProduct,
      importProductsBatch,
      saveCategory,
      deleteCategory,
      reorderCategory,
      updateCustomerDetails,
      adjustProductStock,
      saveCoupon,
      deleteCoupon,
      updateStoreSettings,
      simulateIncomingRealtimeOrder,
      resetDemoDatabase,
      toast,
      showToast,
      dismissToast,
    ]
  );

  return (
    <VitalSurContext.Provider value={value}>
      {children}
    </VitalSurContext.Provider>
  );
}

export function useVitalSur() {
  const ctx = useContext(VitalSurContext);
  if (!ctx) {
    throw new Error("useVitalSur debe usarse dentro de VitalSurProvider");
  }
  return ctx;
}

