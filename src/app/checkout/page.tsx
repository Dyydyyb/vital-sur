"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Truck,
  CreditCard,
  Landmark,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  Package,
} from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
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

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mercado_pago");
  const [mpCardLast4, setMpCardLast4] = useState("4509");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedAlias, setCopiedAlias] = useState(false);

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

  const handleCopyAlias = () => {
    try {
      navigator.clipboard.writeText(db.settings.bankAlias);
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } catch {
      // Ignorar
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      let paymentReference = `TRF-${Date.now().toString().slice(-6)}`;

      if (paymentMethod === "mercado_pago") {
        const mpRes = await fetch("/api/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart,
            total: cartTotal,
            payer: { name: customerName, email: customerEmail },
          }),
        });
        if (mpRes.ok) {
          const mpData = await mpRes.json();
          paymentReference = mpData.paymentReference || `MP-TEST-${mpCardLast4}`;
        }
      }

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
        initialStatus:
          paymentMethod === "mercado_pago" ? "pagado" : "pago_pendiente",
      });

      setCompletedOrder(created);
      showToast(
        `¡Pedido #${created.orderNumber} confirmado!`,
        "Ya ingresó en tiempo real al panel de administración de Vital Sur."
      );
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
                  {completedOrder.paymentMethod === "mercado_pago"
                    ? `Mercado Pago Modo Prueba (${completedOrder.paymentReference})`
                    : `Transferencia Bancaria (${db.settings.bankAlias})`}
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
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-pill bg-brand-green px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-brand-green-dark transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Seguir explorando el catálogo</span>
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-pill border border-brand-border bg-white px-6 py-3 text-xs sm:text-sm font-bold text-brand-ink hover:border-brand-green"
              >
                <Package className="h-4 w-4 text-brand-green" />
                <span>Ver pedido en el Panel CRM</span>
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

              {/* 3. Selección de Método de Pago */}
              <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
                <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
                  3. Método de Pago
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mercado_pago")}
                    className={`flex items-start gap-3 rounded-card p-4 border text-left transition-all ${
                      paymentMethod === "mercado_pago"
                        ? "border-brand-green bg-brand-green-soft/50 shadow-sm"
                        : "border-brand-border bg-brand-surface hover:border-brand-green/50"
                    }`}
                  >
                    <CreditCard
                      className="h-5 w-5 shrink-0 text-brand-blue-dark mt-0.5"
                      strokeWidth={2}
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-brand-ink">
                        Mercado Pago (Modo Prueba)
                      </p>
                      <p className="text-[11px] text-brand-ink-muted mt-0.5">
                        Tarjetas de débito, crédito o dinero en cuenta con
                        acreditación instantánea.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transferencia")}
                    className={`flex items-start gap-3 rounded-card p-4 border text-left transition-all ${
                      paymentMethod === "transferencia"
                        ? "border-brand-green bg-brand-green-soft/50 shadow-sm"
                        : "border-brand-border bg-brand-surface hover:border-brand-green/50"
                    }`}
                  >
                    <Landmark
                      className="h-5 w-5 shrink-0 text-brand-green mt-0.5"
                      strokeWidth={2}
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-extrabold text-brand-ink">
                        Transferencia Bancaria / CBU
                      </p>
                      <p className="text-[11px] text-brand-ink-muted mt-0.5">
                        Transferí desde cualquier banco o billetera virtual a
                        nuestra cuenta oficial.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Detalle según medio elegido */}
                {paymentMethod === "mercado_pago" ? (
                  <div className="rounded-card bg-brand-blue-light/60 border border-brand-blue p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-brand-blue-dark">
                        Sandbox de Prueba Mercado Pago Activo
                      </span>
                      <span className="rounded-pill bg-white px-2.5 py-0.5 text-[10px] font-bold text-brand-ink border border-brand-border">
                        Clave: {db.settings.mpPublicKey.slice(0, 16)}...
                      </span>
                    </div>
                    <p className="text-xs text-brand-ink-muted">
                      Simulación de pago aprobado en entorno de pruebas: no se
                      realizarán cargos reales.
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-brand-ink">
                        Tarjeta de prueba:
                      </label>
                      <select
                        value={mpCardLast4}
                        onChange={(e) => setMpCardLast4(e.target.value)}
                        className="rounded-pill border border-brand-border bg-white px-3 py-1.5 text-xs font-bold text-brand-ink"
                      >
                        <option value="4509">
                          Visa Débito terminada en 4509 (APROBAR)
                        </option>
                        <option value="8821">
                          Mastercard Crédito terminada en 8821 (APROBAR)
                        </option>
                        <option value="0012">
                          Dinero en cuenta Mercado Pago (APROBAR)
                        </option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-card bg-brand-surface border border-brand-border p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-ink-muted">
                        Alias Bancario:
                      </span>
                      <div className="flex items-center gap-2">
                        <strong className="font-display text-sm text-brand-green-dark">
                          {db.settings.bankAlias}
                        </strong>
                        <button
                          type="button"
                          onClick={handleCopyAlias}
                          className="inline-flex items-center gap-1 rounded-pill bg-white border border-brand-border px-2.5 py-1 text-[11px] font-bold text-brand-ink hover:border-brand-green"
                        >
                          {copiedAlias ? (
                            <>
                              <Check className="h-3 w-3 text-brand-green" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-brand-ink-muted">
                        CBU / CVU:
                      </span>
                      <span className="font-mono font-bold text-brand-ink">
                        {db.settings.bankCbu}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-brand-ink-muted">
                        Titular:
                      </span>
                      <span className="font-semibold text-brand-ink">
                        {db.settings.bankHolder}
                      </span>
                    </div>
                  </div>
                )}
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
                      ? "Procesando tu pedido..."
                      : paymentMethod === "mercado_pago"
                      ? `Pagar ${formatARS(cartTotal)} con Mercado Pago`
                      : `Confirmar Pedido por ${formatARS(cartTotal)}`}
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

