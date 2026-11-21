"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Package,
} from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { WhatsAppSvg } from "@/components/brand/CategoryIcon";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS, ARGENTINA_PROVINCES } from "@/lib/format";
import { Order, PaymentMethod } from "@/lib/types";

export default function CheckoutPage() {
  const {
    db,
    cart,
    cartSubtotal,
    cartDiscount,
    shippingInfo,
    cartTotal,
    createOrder,
    showToast,
  } = useVitalSur();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDni, setCustomerDni] = useState("");

  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingProvince, setShippingProvince] = useState<string>(
    ARGENTINA_PROVINCES[0]
  );
  const [shippingCity, setShippingCity] = useState("Florencio Varela");
  const [shippingPostalCode, setShippingPostalCode] = useState("1888");
  const [shippingNotes, setShippingNotes] = useState("");

  const [paymentMethod] = useState<PaymentMethod>("whatsapp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const buildWhatsAppOrderUrl = (order: Order) => {
    const phoneDigits = (db.settings.whatsappNumber || "5491134062942").replace(/\D/g, "");
    const lines = [
      `Hola Vital Sur! Quiero finalizar mi pedido *#${order.orderNumber}*`,
      ``,
      `*Cliente:* ${order.customerName}`,
      `*DNI:* ${order.customerDni}`,
      `*Envío:* ${order.shippingAddress}, ${order.shippingCity} (${order.shippingProvince}, CP ${order.shippingPostalCode})`,
      ``,
      `*Productos:*`,
      ...order.items.map(
        (it) =>
          `• ${it.quantity}x ${it.productName} (${it.flavor}, ${it.size}) - ${formatARS(it.unitPrice * it.quantity)}`
      ),
      ``,
      `*Subtotal:* ${formatARS(order.subtotal)}`,
      order.discount > 0 ? `*Descuento:* -${formatARS(order.discount)}` : null,
      `*Envío (${db.settings.shippingCarrier}):* ${order.shippingCost === 0 ? "GRATIS ($0)" : formatARS(order.shippingCost)}`,
      `*Total a convenir:* ${formatARS(order.total)}`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(lines)}`;
  };

  const handleFillSampleData = () => {
    setCustomerName("Federico Nicolás Quiroga");
    setCustomerEmail("fede.quiroga.varela@gmail.com");
    setCustomerPhone("+54 9 11 5840-2291");
    setCustomerDni("39.410.882");
    setShippingAddress("Av. Teniente General Perón 1650, Piso 3B");
    setShippingProvince("Buenos Aires (GBA Sur)");
    setShippingCity("Florencio Varela");
    setShippingPostalCode("1888");
    setShippingNotes("Entregar por la tarde, timbre 3B.");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const paymentReference = `WA-${Date.now().toString().slice(-6)}`;

      const created = await createOrder({
        customerName,
        customerEmail,
        customerPhone,
        customerDni,
        shippingAddress,
        shippingCity,
        shippingProvince,
        shippingPostalCode,
        shippingNotes,
        paymentMethod,
        paymentReference,
        initialStatus: "pago_pendiente",
      });

      setCompletedOrder(created);
      showToast(
        `¡Pedido #${created.orderNumber} registrado!`,
        "Ahora finalizá el pago y coordinación por WhatsApp."
      );
      try {
        window.open(buildWhatsAppOrderUrl(created), "_blank", "noopener,noreferrer");
      } catch {
        // Si el navegador bloquea popups, el botón directo en pantalla permite abrir WhatsApp
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-white">
        <StoreHeader />
        <main className="flex-1 mx-auto max-w-3xl w-full px-4 pt-28 pb-20 sm:px-6">
          <div className="rounded-card-lg bg-brand-surface border border-brand-border p-8 sm:p-10 shadow-soft-md text-center space-y-6 animate-fade-slide">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-green text-white shadow-soft">
              <CheckCircle2 className="h-10 w-10" strokeWidth={2.2} />
            </div>

            <div>
              <span className="inline-flex items-center rounded-pill bg-brand-green-soft px-3.5 py-1 text-xs font-extrabold uppercase text-brand-green-dark">
                Orden Confirmada #{completedOrder.orderNumber}
              </span>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
                ¡Muchas gracias por tu compra, {completedOrder.customerName}!
              </h1>
              <p className="mt-1.5 text-sm text-brand-ink-muted">
                Enviamos el comprobante a{" "}
                <strong>{completedOrder.customerEmail}</strong>. Nuestro equipo
                de Florencio Varela ya recibió tu pedido en tiempo real.
              </p>
            </div>

            <div className="rounded-card bg-white border border-brand-border p-5 text-left space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-brand-border pb-2.5">
                <span className="text-brand-ink-muted">Número de Pedido:</span>
                <strong className="text-brand-ink">
                  {completedOrder.orderNumber}
                </strong>
              </div>
              <div className="flex justify-between border-b border-brand-border pb-2.5">
                <span className="text-brand-ink-muted">Método de Pago:</span>
                <strong className="text-brand-ink">
                  A convenir en WhatsApp
                </strong>
              </div>
              <div className="flex justify-between border-b border-brand-border pb-2.5">
                <span className="text-brand-ink-muted">
                  Envío por {db.settings.shippingCarrier}:
                </span>
                <strong className="text-brand-green-dark">
                  {completedOrder.shippingCost === 0
                    ? "GRATIS ($0)"
                    : formatARS(completedOrder.shippingCost)}
                </strong>
              </div>
              <div className="flex justify-between border-b border-brand-border pb-2.5">
                <span className="text-brand-ink-muted">Destino de entrega:</span>
                <strong className="text-brand-ink text-right">
                  {completedOrder.shippingAddress},{" "}
                  {completedOrder.shippingCity} (CP{" "}
                  {completedOrder.shippingPostalCode})
                </strong>
              </div>
              <div className="flex justify-between pt-1 text-base font-extrabold">
                <span className="text-brand-ink">Total abonado:</span>
                <span className="text-brand-green-dark">
                  {formatARS(completedOrder.total)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href={buildWhatsAppOrderUrl(completedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-pill bg-brand-green px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-brand-green-dark transition-colors shadow-soft"
              >
                <WhatsAppSvg className="h-4 w-4" />
                <span>Finalizar compra en WhatsApp</span>
              </a>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-pill border border-brand-border bg-white px-6 py-3 text-xs sm:text-sm font-bold text-brand-ink hover:border-brand-green transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Seguir explorando el catálogo</span>
              </Link>
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <StoreHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
              Finalizar Compra Segura
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
              Datos de Envío y Pago
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFillSampleData}
              className="rounded-pill bg-brand-surface border border-brand-border px-4 py-2 text-xs font-bold text-brand-green-dark hover:border-brand-green transition-colors"
            >
              Autocompletar datos de prueba
            </button>
            <Link
              href="/carrito"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-ink-muted hover:text-brand-green"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al carrito</span>
            </Link>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-card-lg bg-brand-surface border border-brand-border p-12 text-center">
            <p className="font-display text-lg font-bold text-brand-ink">
              Tu carrito está vacío
            </p>
            <Link
              href="/productos"
              className="mt-4 inline-flex rounded-pill bg-brand-green px-6 py-2.5 text-xs font-bold text-white"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitOrder}
            className="grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            {/* Columna izquierda: Formulario del cliente y pago */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Datos del Cliente */}
              <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
                <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
                  1. Tus Datos de Contacto
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Lucas Gómez"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+54 9 11 5555-5555"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      DNI o CUIT (Para Correo Argentino) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerDni}
                      onChange={(e) => setCustomerDni(e.target.value)}
                      placeholder="Ej: 38.492.104"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Dirección de Envío */}
              <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h2 className="font-display text-base font-extrabold text-brand-ink">
                    2. Dirección de Envío ({db.settings.shippingCarrier})
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-green-dark">
                    <Truck className="h-4 w-4" />
                    Todo el país
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Calle, altura, piso y departamento *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Ej: Mitre 450, Piso 2B"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Provincia *
                    </label>
                    <select
                      value={shippingProvince}
                      onChange={(e) => setShippingProvince(e.target.value)}
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    >
                      {ARGENTINA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Localidad / Partido *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="Ej: Florencio Varela"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      placeholder="Ej: 1888"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-ink mb-1.5">
                      Indicaciones para el cartero (opcional)
                    </label>
                    <input
                      type="text"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      placeholder="Ej: Entre calles Mitre y España"
                      className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Método de Pago */}
              <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
                <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
                  3. Método de Pago
                </h2>

                <div className="flex items-start gap-3.5 rounded-card border border-brand-green bg-brand-green-soft/50 p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
                    <WhatsAppSvg className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold text-brand-ink">
                      A convenir en WhatsApp
                    </p>
                    <p className="text-xs text-brand-ink-muted leading-relaxed">
                      Al confirmar tu pedido, se abrirá WhatsApp con el detalle completo de tu compra para coordinar el pago y el envío directamente con nuestro equipo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Resumen final y confirmación */}
            <aside className="lg:col-span-5 space-y-5">
              <div className="rounded-card-lg bg-brand-surface border border-brand-border p-6 shadow-soft space-y-5 sticky top-28">
                <h2 className="font-display text-lg font-extrabold text-brand-ink border-b border-brand-border pb-3">
                  Resumen de tu Pedido
                </h2>

                <ul className="divide-y divide-brand-border/60 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <li
                      key={`${item.productId}-${item.flavor}-${item.size}`}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-brand-ink">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-brand-ink-muted">
                          {item.flavor} · {item.size}
                        </p>
                      </div>
                      <span className="font-extrabold text-brand-ink shrink-0">
                        {formatARS(item.unitPrice * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 border-t border-brand-border pt-4 text-sm">
                  <div className="flex justify-between text-brand-ink-muted">
                    <span>Subtotal</span>
                    <span className="font-bold text-brand-ink">
                      {formatARS(cartSubtotal)}
                    </span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-brand-green-dark">
                      <span>Descuento por cupón</span>
                      <span className="font-bold">
                        -{formatARS(cartDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-ink-muted">
                    <span>Envío ({db.settings.shippingCarrier})</span>
                    {shippingInfo.isFreeShipping ? (
                      <span className="font-extrabold text-brand-green-dark">
                        GRATIS ($0)
                      </span>
                    ) : (
                      <span className="font-bold text-brand-ink">
                        {formatARS(shippingInfo.shippingCost)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between border-t border-brand-border pt-3 text-base font-extrabold text-brand-ink">
                    <span>Total final</span>
                    <span className="font-display text-2xl text-brand-green-dark">
                      {formatARS(cartTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-pill bg-brand-green py-4 px-6 text-sm font-bold text-white hover:bg-brand-green-dark transition-all shadow-soft disabled:opacity-60"
                >
                  <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
                  <span>
                    {isSubmitting
                      ? "Registrando tu pedido..."
                      : `Finalizar compra en WhatsApp (${formatARS(cartTotal)})`}
                  </span>
                </button>
              </div>
            </aside>
          </form>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

