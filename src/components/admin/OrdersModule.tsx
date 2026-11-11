"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BellRing,
  Printer,
  Truck,
  CheckCircle2,
  Eye,
  Save,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/types";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS, formatDateTimeAR } from "@/lib/format";
import { ShippingLabelModal } from "./ShippingLabelModal";

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badgeClass: string }
> = {
  nuevo: {
    label: "Nuevo",
    badgeClass: "bg-brand-blue-light text-brand-blue-dark border-brand-blue",
  },
  pago_pendiente: {
    label: "Pago Pendiente",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  pagado: {
    label: "Pagado",
    badgeClass: "bg-brand-green-soft text-brand-green-dark border-brand-green/30",
  },
  en_preparacion: {
    label: "En Preparación",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
  },
  despachado: {
    label: "Despachado",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  entregado: {
    label: "Entregado",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  cancelado: {
    label: "Cancelado",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
};

export function OrdersModule() {
  const {
    db,
    unreadOrdersCount,
    updateOrderStatus,
    updateOrderTrackingAndNotes,
    markOrderAsRead,
    markAllOrdersAsRead,
    simulateIncomingRealtimeOrder,
  } = useVitalSur();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    db.orders[0]?.id || null
  );
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);

  const selectedOrder = useMemo(
    () => db.orders.find((o) => o.id === selectedOrderId) || db.orders[0] || null,
    [db.orders, selectedOrderId]
  );

  const [trackingDraft, setTrackingDraft] = useState(
    selectedOrder?.trackingNumber || ""
  );
  const [notesDraft, setNotesDraft] = useState(
    selectedOrder?.internalNotes || ""
  );

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setTrackingDraft(order.trackingNumber || "");
    setNotesDraft(order.internalNotes || "");
    if (order.isUnread) {
      markOrderAsRead(order.id);
    }
  };

  const filteredOrders = useMemo(() => {
    return db.orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = order.orderNumber.toLowerCase().includes(q);
        const matchName = order.customerName.toLowerCase().includes(q);
        const matchCity = order.shippingCity.toLowerCase().includes(q);
        const matchTracking = order.trackingNumber.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchCity && !matchTracking)
          return false;
      }
      return true;
    });
  }, [db.orders, statusFilter, searchQuery]);

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    await updateOrderTrackingAndNotes(
      selectedOrder.id,
      trackingDraft,
      notesDraft
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y notificación en tiempo real */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              unreadOrdersCount > 0
                ? "bg-brand-green text-white"
                : "bg-brand-surface text-brand-green"
            }`}
          >
            <BellRing className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-extrabold text-brand-ink">
                 Recepción de Pedidos en Tiempo Real
              </h2>
              {unreadOrdersCount > 0 && (
                <span className="rounded-pill bg-brand-green-soft px-2.5 py-0.5 text-xs font-extrabold text-brand-green-dark">
                  {unreadOrdersCount} sin leer
                </span>
              )}
            </div>
            <p className="text-xs text-brand-ink-muted">
              Gestioná estados, asigná el código de seguimiento de Correo
              Argentino e imprimí etiquetas de despacho.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadOrdersCount > 0 && (
            <button
              type="button"
              onClick={markAllOrdersAsRead}
              className="inline-flex items-center gap-1.5 rounded-pill border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-bold text-brand-ink hover:border-brand-green"
            >
              <CheckCheck className="h-4 w-4 text-brand-green" />
              <span>Marcar todos como leídos</span>
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              const created = await simulateIncomingRealtimeOrder();
              handleSelectOrder(created);
            }}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green px-4 py-2 text-xs font-bold text-white hover:bg-brand-green-dark transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            <span>Simular Pedido en Tiempo Real</span>
          </button>
        </div>
      </div>

      {/* Filtros por Estado y Buscador */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-pill px-3.5 py-1.5 text-xs font-bold transition-colors ${
              statusFilter === "all"
                ? "bg-brand-ink text-white"
                : "bg-white border border-brand-border text-brand-ink hover:border-brand-green"
            }`}
          >
            Todos ({db.orders.length})
          </button>
          {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((st) => {
            const count = db.orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-pill px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-brand-green text-white"
                    : "bg-white border border-brand-border text-brand-ink hover:border-brand-green"
                }`}
              >
                {ORDER_STATUS_META[st].label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar orden, cliente, seguimiento..."
            className="w-full rounded-pill border border-brand-border bg-white py-2 pl-9 pr-4 text-xs font-medium text-brand-ink focus:border-brand-green focus:outline-none"
          />
          <Search
            className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-ink-subtle"
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Vista Maestra-Detalle de Pedidos */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Lista de Pedidos */}
        <div className="xl:col-span-7 rounded-card-lg bg-white border border-brand-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-brand-surface text-brand-ink-muted">
                  <th className="py-3 px-4 font-bold">Orden</th>
                  <th className="py-3 px-4 font-bold">Cliente / Destino</th>
                  <th className="py-3 px-4 font-bold">Estado</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-xs text-brand-ink-muted"
                    >
                      No hay pedidos registrados con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  const meta = ORDER_STATUS_META[order.status];
                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-brand-green-soft/40"
                          : "hover:bg-brand-surface/60"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {order.isUnread && (
                            <span
                              title="Pedido nuevo sin leer"
                              className="h-2.5 w-2.5 rounded-full bg-brand-green shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-display font-extrabold text-brand-ink block">
                              #{order.orderNumber}
                            </span>
                            <span className="text-[11px] text-brand-ink-muted">
                              {formatDateTimeAR(order.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-brand-ink">
                          {order.customerName}
                        </p>
                        <p className="text-[11px] text-brand-ink-muted">
                          {order.shippingCity} ({order.shippingPostalCode})
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-pill border px-2.5 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        {order.trackingNumber && (
                          <span className="block text-[10px] font-mono font-bold text-brand-blue-dark mt-0.5">
                            {order.trackingNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-display font-extrabold text-brand-ink">
                          {formatARS(order.total)}
                        </span>
                        <span className="block text-[10px] text-brand-ink-muted">
                          {order.shippingCost === 0
                            ? "Envío Gratis"
                            : `Envío ${formatARS(order.shippingCost)}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrder(order);
                          }}
                          className="inline-flex items-center gap-1 rounded-pill border border-brand-border bg-white px-3 py-1 text-[11px] font-bold text-brand-ink hover:border-brand-green"
                        >
                          <Eye className="h-3.5 w-3.5 text-brand-green" />
                          <span>Detalle</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ficha Detallada del Pedido Seleccionado */}
        <div className="xl:col-span-5">
          {selectedOrder ? (
            <div className="rounded-card-lg bg-white border border-brand-border p-5 sm:p-6 shadow-soft space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-green">
                    Detalle del Pedido #{selectedOrder.orderNumber}
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-brand-ink">
                    {selectedOrder.customerName}
                  </h3>
                  <p className="text-xs text-brand-ink-muted">
                    DNI: {selectedOrder.customerDni} · Tel:{" "}
                    {selectedOrder.customerPhone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLabelOrder(selectedOrder)}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-brand-ink px-4 py-2 text-xs font-bold text-white hover:bg-brand-green transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>Etiqueta / Remito</span>
                </button>
              </div>

              {/* Cambio de estado del pedido */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-ink mb-2">
                  Cambiar Estado del Pedido
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateOrderStatus(selectedOrder.id, st)}
                        className={`rounded-xl px-2.5 py-2 text-[11px] font-bold border transition-all ${
                          selectedOrder.status === st
                            ? "bg-brand-green text-white border-brand-green shadow-sm"
                            : "bg-brand-surface text-brand-ink border-brand-border hover:border-brand-green"
                        }`}
                      >
                        {ORDER_STATUS_META[st].label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Dirección y Pago */}
              <div className="rounded-card bg-brand-surface p-4 border border-brand-border space-y-2 text-xs">
                <p className="font-bold text-brand-ink">
                  Destino ({db.settings.shippingCarrier}):
                </p>
                <p className="text-brand-ink-muted">
                  {selectedOrder.shippingAddress}, {selectedOrder.shippingCity},{" "}
                  {selectedOrder.shippingProvince} (CP{" "}
                  {selectedOrder.shippingPostalCode})
                </p>
                {selectedOrder.shippingNotes && (
                  <p className="text-brand-green-dark font-semibold">
                    Indicaciones: {selectedOrder.shippingNotes}
                  </p>
                )}
                <div className="pt-2 border-t border-brand-border/60 flex justify-between">
                  <span className="text-brand-ink-muted">Medio de pago:</span>
                  <strong className="text-brand-ink">
                    {selectedOrder.paymentMethod === "mercado_pago"
                      ? `Mercado Pago (${selectedOrder.paymentReference})`
                      : `Transferencia (${selectedOrder.paymentReference})`}
                  </strong>
                </div>
              </div>

              {/* Productos del Pedido */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-ink mb-2">
                  Ítems ({selectedOrder.items.length})
                </h4>
                <div className="rounded-card border border-brand-border divide-y divide-brand-border/60 text-xs">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-brand-ink">
                          {item.quantity}x {item.productName}
                        </p>
                        <p className="text-[11px] text-brand-ink-muted">
                          SKU {item.sku} · {item.flavor} · {item.size}
                        </p>
                      </div>
                      <span className="font-extrabold text-brand-ink">
                        {formatARS(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-brand-surface space-y-1">
                    <div className="flex justify-between text-brand-ink-muted">
                      <span>Subtotal:</span>
                      <span>{formatARS(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-brand-ink-muted">
                      <span>Envío Correo Argentino:</span>
                      <span>
                        {selectedOrder.shippingCost === 0
                          ? "GRATIS ($0)"
                          : formatARS(selectedOrder.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-brand-ink pt-1 border-t border-brand-border">
                      <span>Total del Pedido:</span>
                      <span className="text-brand-green-dark">
                        {formatARS(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de Seguimiento Correo Argentino y Notas Internas */}
              <form
                onSubmit={handleSaveTracking}
                className="space-y-3 border-t border-brand-border pt-4"
              >
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-ink mb-1.5">
                    Número de Seguimiento Correo Argentino
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingDraft}
                      onChange={(e) => setTrackingDraft(e.target.value)}
                      placeholder="Ej: CP849201955AR"
                      className="flex-1 rounded-pill border border-brand-border bg-brand-surface px-4 py-2 text-xs font-mono font-bold text-brand-ink uppercase focus:border-brand-green focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTrackingDraft(
                          `CP${Math.floor(100000000 + Math.random() * 900000000)}AR`
                        )
                      }
                      className="rounded-pill border border-brand-border bg-white px-3 py-2 text-[11px] font-bold text-brand-ink hover:border-brand-green"
                    >
                      Generar Código
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-ink mb-1.5">
                    Notas Internas del Equipo (Florencio Varela)
                  </label>
                  <textarea
                    rows={2}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Observaciones de armado, lote o despacho..."
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface p-3 text-xs text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-pill bg-brand-green py-2.5 px-4 text-xs font-bold text-white hover:bg-brand-green-dark transition-colors"
                >
                  <Save className="h-4 w-4" strokeWidth={2} />
                  <span>Guardar Seguimiento y Notas</span>
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal de Etiqueta de Envío e Impresión */}
      <ShippingLabelModal
        order={labelOrder}
        settings={db.settings}
        onClose={() => setLabelOrder(null)}
      />
    </div>
  );
}

