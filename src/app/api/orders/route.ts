import { NextRequest, NextResponse } from "next/server";
import {
  Order,
  OrderItem,
  Customer,
  StockMovement,
  PaymentMethod,
} from "@/lib/types";
import { calculateShipping } from "@/lib/format";
import { loadAuthoritativeDb, persistFullStateToDb } from "@/lib/store-service";

export const dynamic = "force-dynamic";

interface CheckoutItemInput {
  productId: string;
  flavor?: string;
  size?: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const customerName = String(body?.customerName || "").trim();
    const customerEmail = String(body?.customerEmail || "").trim().toLowerCase();
    const customerPhone = String(body?.customerPhone || "").trim();
    const customerDni = String(body?.customerDni || "").trim();
    const shippingAddress = String(body?.shippingAddress || "").trim();
    const shippingCity = String(body?.shippingCity || "").trim();
    const shippingProvince = String(body?.shippingProvince || "").trim();
    const shippingPostalCode = String(body?.shippingPostalCode || "").trim();
    const shippingNotes = String(body?.shippingNotes || "").trim();
    const paymentMethod = (body?.paymentMethod || "mercado_pago") as PaymentMethod;
    const paymentReference = String(body?.paymentReference || "").trim();
    const couponCodeInput = String(body?.couponCode || "").trim().toUpperCase();
    const rawItems = Array.isArray(body?.items) ? (body.items as CheckoutItemInput[]) : [];

    if (
      !customerName ||
      !customerEmail.includes("@") ||
      !customerPhone ||
      !customerDni ||
      !shippingAddress ||
      !shippingCity ||
      !shippingProvince ||
      !shippingPostalCode
    ) {
      return NextResponse.json(
        { error: "Completá todos los datos obligatorios de contacto y envío." },
        { status: 400 }
      );
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío." },
        { status: 400 }
      );
    }

    const db = await loadAuthoritativeDb();

    // Validar productos y recalcular precios/costos desde el servidor
    const orderItems: OrderItem[] = [];
    const stockDeltas = new Map<string, number>();

    for (const reqItem of rawItems) {
      const qty = Math.floor(Number(reqItem.quantity));
      if (!reqItem.productId || !Number.isFinite(qty) || qty <= 0 || qty > 99) {
        return NextResponse.json(
          { error: "Cantidad de producto inválida." },
          { status: 400 }
        );
      }

      const product = db.products.find((p) => p.id === reqItem.productId && p.active);
      if (!product) {
        return NextResponse.json(
          { error: "Uno de los productos del carrito ya no está disponible." },
          { status: 400 }
        );
      }

      const prevRequested = stockDeltas.get(product.id) || 0;
      if (prevRequested + qty > product.stock) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.name} (disponible: ${product.stock}).`,
          },
          { status: 409 }
        );
      }
      stockDeltas.set(product.id, prevRequested + qty);

      const authoritativePrice = product.salePrice ?? product.price;
      orderItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        flavor: String(reqItem.flavor || product.flavors[0] || "Clásico").slice(0, 80),
        size: String(reqItem.size || product.sizes[0] || "Estándar").slice(0, 80),
        quantity: qty,
        unitPrice: authoritativePrice,
        unitCost: product.cost || 0,
      });
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Validar cupón en servidor
    let discount = 0;
    let appliedCouponId: string | null = null;
    let appliedCouponCode: string | null = null;

    if (couponCodeInput) {
      const coupon = db.coupons.find(
        (c) => c.code.toUpperCase() === couponCodeInput && c.active
      );
      const today = new Date().toISOString().slice(0, 10);
      if (
        coupon &&
        (!coupon.expiresAt || coupon.expiresAt >= today) &&
        coupon.usedCount < coupon.maxUses &&
        subtotal >= coupon.minPurchase
      ) {
        discount =
          coupon.discountType === "PERCENTAGE"
            ? Math.round((subtotal * coupon.discountValue) / 100)
            : Math.min(subtotal, coupon.discountValue);
        appliedCouponId = coupon.id;
        appliedCouponCode = coupon.code;
      }
    }

    const shipping = calculateShipping(
      subtotal,
      db.settings.shippingCost,
      db.settings.freeShippingThreshold
    );

    const total = Math.max(0, subtotal - discount + shipping.shippingCost);
    const estimatedCost = orderItems.reduce(
      (sum, it) => sum + it.unitCost * it.quantity,
      0
    );

    const nowIso = new Date().toISOString();
    const orderNumber = `VS-${new Date().getFullYear()}-${String(
      1001 + db.orders.length
    )}`;

    const existingCustomer = db.customers.find(
      (c) => c.email.toLowerCase() === customerEmail
    );
    const customerId = existingCustomer
      ? existingCustomer.id
      : `cust-${Date.now()}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      status: paymentMethod === "mercado_pago" ? "pagado" : "pago_pendiente",
      paymentMethod,
      paymentReference:
        paymentReference ||
        (paymentMethod === "mercado_pago"
          ? `MP-${Date.now()}`
          : `TRF-${Date.now()}`),
      subtotal,
      discount,
      couponCode: appliedCouponCode,
      shippingCost: shipping.shippingCost,
      total,
      estimatedCost,
      trackingNumber: "",
      internalNotes: "",
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerDni,
      shippingAddress,
      shippingCity,
      shippingProvince,
      shippingPostalCode,
      shippingNotes,
      isUnread: true,
      items: orderItems,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedCustomers: Customer[] = existingCustomer
      ? db.customers.map((c) =>
          c.id === existingCustomer.id
            ? {
                ...c,
                name: customerName,
                phone: customerPhone,
                dni: customerDni,
                address: shippingAddress,
                city: shippingCity,
                province: shippingProvince,
                postalCode: shippingPostalCode,
                totalSpent: c.totalSpent + total,
                ordersCount: c.ordersCount + 1,
                lastOrderAt: nowIso,
              }
            : c
        )
      : [
          {
            id: customerId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            dni: customerDni,
            address: shippingAddress,
            city: shippingCity,
            province: shippingProvince,
            postalCode: shippingPostalCode,
            totalSpent: total,
            ordersCount: 1,
            tags: ["Nuevo"],
            notes: "",
            createdAt: nowIso,
            lastOrderAt: nowIso,
          },
          ...db.customers,
        ];

    const newMovements: StockMovement[] = [];
    const updatedProducts = db.products.map((p) => {
      const qtyDelta = stockDeltas.get(p.id);
      if (!qtyDelta) return p;
      const prevStock = p.stock;
      const newStock = Math.max(0, prevStock - qtyDelta);
      newMovements.push({
        id: `mov-${Date.now()}-${p.id}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        type: "SALIDA_VENTA",
        quantity: -qtyDelta,
        previousStock: prevStock,
        newStock,
        reason: `Venta tienda web (${orderNumber})`,
        createdBy: "Tienda Web",
        createdAt: nowIso,
      });
      return {
        ...p,
        stock: newStock,
        soldCount: (p.soldCount || 0) + qtyDelta,
      };
    });

    const updatedCoupons = appliedCouponId
      ? db.coupons.map((c) =>
          c.id === appliedCouponId ? { ...c, usedCount: c.usedCount + 1 } : c
        )
      : db.coupons;

    await persistFullStateToDb({
      ...db,
      products: updatedProducts,
      orders: [newOrder, ...db.orders],
      customers: updatedCustomers,
      stockMovements: [...newMovements, ...db.stockMovements],
      coupons: updatedCoupons,
    });

    return NextResponse.json({ ok: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Error procesando pedido:", error);
    return NextResponse.json(
      { error: "No se pudo procesar el pedido. Intentá nuevamente." },
      { status: 500 }
    );
  }
}

