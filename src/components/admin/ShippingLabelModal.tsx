"use client";

import React from "react";
import { X, Printer, Truck, MapPin, Package } from "lucide-react";
import { Order, StoreSettings } from "@/lib/types";
import { formatARS, formatDateAR } from "@/lib/format";
import { VitalSurLogo } from "@/components/brand/VitalSurLogo";

interface ShippingLabelModalProps {
  order: Order | null;
  settings: StoreSettings;
  onClose: () => void;
}

export function ShippingLabelModal({
  order,
  settings,
  onClose,
}: ShippingLabelModalProps) {
  if (!order) return null;

  const trackingCode =
    order.trackingNumber || `CP${order.orderNumber.replace(/\D/g, "")}8492AR`;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-brand-ink/50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-card-lg bg-white border border-brand-border shadow-soft-lg overflow-hidden my-8">
        {/* Barra superior de acciones (no se imprime) */}
        <div className="no-print flex items-center justify-between bg-brand-surface px-6 py-4 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-brand-green" strokeWidth={2} />
            <h3 className="font-display text-base font-extrabold text-brand-ink">
              Etiqueta de Envío Correo Argentino y Remito — #{order.orderNumber}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green px-4 py-2 text-xs font-bold text-white hover:bg-brand-green-dark"
            >
              <Printer className="h-4 w-4" strokeWidth={2} />
              <span>Imprimir Etiqueta / Remito</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-full p-2 text-brand-ink-muted hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Documento de Etiqueta + Remito */}
        <div className="p-6 sm:p-8 space-y-6 text-brand-ink">
          <div className="border-2 border-brand-ink rounded-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-brand-ink pb-4">
              <VitalSurLogo variant="monocromatico" size="sm" />
              <div className="text-right">
                <span className="inline-block rounded-md bg-brand-ink px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                  {settings.shippingCarrier.toUpperCase()} · ENCOMIENDA CLÁSICA
                </span>
                <p className="mt-1 text-xs font-bold">
                  Orden: #{order.orderNumber} · Fecha:{" "}
                  {formatDateAR(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Destinatario y Remitente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-brand-border pb-4 text-xs">
              <div className="rounded-xl bg-brand-surface p-3.5 border border-brand-border">
                <p className="font-extrabold uppercase tracking-wider text-brand-green-dark flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  DESTINATARIO (ENTREGAR A):
                </p>
                <p className="mt-1 text-sm font-extrabold text-brand-ink">
                  {order.customerName}
                </p>
                <p className="font-semibold">DNI/CUIT: {order.customerDni}</p>
                <p className="mt-1 font-bold">{order.shippingAddress}</p>
                <p className="font-bold">
                  {order.shippingCity} — {order.shippingProvince}
                </p>
                <p className="mt-1 inline-block rounded bg-brand-ink px-2 py-0.5 text-white font-extrabold">
                  CÓDIGO POSTAL: {order.shippingPostalCode}
                </p>
                {order.shippingNotes && (
                  <p className="mt-1 text-brand-ink-muted">
                    Obs: {order.shippingNotes}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-brand-border">
                <p className="font-extrabold uppercase tracking-wider text-brand-ink-muted">
                  REMITENTE (ORIGEN ZONA SUR):
                </p>
                <p className="mt-1 text-sm font-extrabold text-brand-ink">
                  {settings.storeName} — Suplementos y Bienestar
                </p>
                <p className="mt-1">{settings.address}</p>
                <p>Florencio Varela (CP 1888), Prov. de Buenos Aires</p>
                <p className="mt-1 font-semibold">Tel: {settings.phone}</p>
                <p className="mt-2 text-[11px] font-bold text-brand-green-dark">
                  {order.shippingCost === 0
                    ? "ENVÍO BONIFICADO (COMPRA > $80.000)"
                    : `ENVÍO PAGADO: ${formatARS(order.shippingCost)}`}
                </p>
              </div>
            </div>

            {/* Código de Barras Vectorial SVG de Correo Argentino */}
            <div className="flex flex-col items-center justify-center py-2">
              <svg
                viewBox="0 0 340 64"
                className="w-72 h-14"
                aria-label="Código de barras de seguimiento"
              >
                {[
                  10, 16, 20, 28, 34, 38, 46, 54, 60, 64, 72, 80, 86, 94, 100,
                  108, 114, 122, 130, 134, 142, 150, 156, 164, 170, 178, 186,
                  192, 198, 206, 214, 220, 228, 236, 242, 250, 256, 264, 272,
                  278, 286, 294, 300, 308, 314, 322,
                ].map((x, idx) => (
                  <rect
                    key={x}
                    x={x}
                    y="4"
                    width={idx % 3 === 0 ? "4" : idx % 2 === 0 ? "2" : "3"}
                    height="48"
                    fill="#1F2D2A"
                  />
                ))}
              </svg>
              <p className="font-mono text-sm font-extrabold tracking-[0.25em] text-brand-ink mt-1">
                {trackingCode}
              </p>
            </div>
          </div>

          {/* Remito Interno de Productos */}
          <div className="rounded-card border border-brand-border p-4 text-xs space-y-3">
            <h4 className="font-display font-extrabold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
              <Package className="h-4 w-4 text-brand-green" />
              Remito de Mercadería — Control de Preparación
            </h4>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-border text-brand-ink-muted">
                  <th className="py-1.5">SKU</th>
                  <th className="py-1.5">Producto / Variante</th>
                  <th className="py-1.5 text-center">Cant.</th>
                  <th className="py-1.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-mono font-semibold">{item.sku}</td>
                    <td className="py-2 font-bold">
                      {item.productName} ({item.flavor} · {item.size})
                    </td>
                    <td className="py-2 text-center font-extrabold">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right font-bold">
                      {formatARS(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between border-t border-brand-border pt-2 font-extrabold text-sm">
              <span>TOTAL FACTURADO:</span>
              <span>{formatARS(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

