"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Save,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Edit3,
  Truck,
  ShieldAlert,
} from "lucide-react";
import {
  Category,
  CategoryIconName,
  Coupon,
  OrderStatus,
  PaymentMethod,
} from "@/lib/types";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS, formatDateAR, formatDateTimeAR, escapeCsvCell } from "@/lib/format";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { ORDER_STATUS_META } from "./OrdersModule";

const AVAILABLE_ICONS: { value: CategoryIconName; label: string }[] = [
  { value: "dumbbell", label: "Mancuerna (Fuerza / Proteínas)" },
  { value: "zap", label: "Rayo (Energía / Creatinas)" },
  { value: "activity", label: "Pulso (Recuperación / Aminoácidos)" },
  { value: "flame", label: "Llama (Pre-Entreno / Termogénico)" },
  { value: "shield-plus", label: "Escudo Salud (Vitaminas)" },
  { value: "heart-pulse", label: "Cardio (Bienestar / Metabolismo)" },
  { value: "cup-soda", label: "Shaker / Accesorios" },
  { value: "leaf", label: "Hoja Orgánica (Plant-Based)" },
  { value: "sparkles", label: "Pureza / Destacado" },
  { value: "package", label: "Pack / Combo" },
];

/* =========================================================
   MÓDULO DE CATEGORÍAS Y SUBCATEGORÍAS
   ========================================================= */
export function CategoriesModule() {
  const { db, saveCategory, deleteCategory, reorderCategory } = useVitalSur();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState<CategoryIconName>("dumbbell");
  const [parentId, setParentId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const rootCategories = useMemo(
    () =>
      db.categories
        .filter((c) => c.parentId === null)
        .sort((a, b) => a.order - b.order),
    [db.categories]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = editingId
      ? db.categories.find((c) => c.id === editingId)
      : null;

    const cat: Category = {
      id: existing ? existing.id : `cat-${Date.now()}`,
      name: name.trim(),
      slug,
      description: description.trim() || "Categoría oficial Vital Sur",
      iconName,
      order: existing ? existing.order : db.categories.length + 1,
      active: existing ? existing.active : true,
      parentId: parentId || null,
    };

    await saveCategory(cat);
    setName("");
    setDescription("");
    setParentId("");
    setEditingId(null);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setIconName(cat.iconName);
    setParentId(cat.parentId || "");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Formulario Crear / Editar Categoría */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleSubmit}
          className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4 text-xs"
        >
          <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
            {editingId ? "Editar Categoría" : "Nueva Categoría o Subcategoría"}
          </h2>

          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ganadores de Peso"
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Categoría Padre (Opcional para anidar subcategoría)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-bold text-brand-ink"
            >
              <option value="">Ninguna (Categoría Principal)</option>
              {rootCategories
                .filter((c) => c.id !== editingId)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    Subcategoría dentro de: {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-brand-ink mb-1.5">
              Asignar Ícono Vectorial SVG
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic.value}
                  type="button"
                  onClick={() => setIconName(ic.value)}
                  title={ic.label}
                  className={`flex flex-col items-center justify-center rounded-2xl p-2.5 border transition-all ${
                    iconName === ic.value
                      ? "bg-brand-green text-white border-brand-green shadow-sm"
                      : "bg-brand-surface text-brand-ink border-brand-border hover:border-brand-green"
                  }`}
                >
                  <CategoryIcon name={ic.value} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la línea de productos..."
              className="w-full rounded-2xl border border-brand-border bg-brand-surface p-3 text-brand-ink"
            />
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setDescription("");
                  setParentId("");
                }}
                className="rounded-pill border border-brand-border bg-white px-4 py-2.5 font-bold text-brand-ink"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-pill bg-brand-green py-2.5 px-5 font-bold text-white hover:bg-brand-green-dark"
            >
              <Save className="h-4 w-4" />
              <span>
                {editingId ? "Guardar Cambios" : "Crear Categoría"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Árbol de Categorías y Subcategorías */}
      <div className="lg:col-span-7 rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
        <h3 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
          Estructura Jerárquica y Ordenamiento ({db.categories.length})
        </h3>

        <div className="space-y-3">
          {rootCategories.map((cat) => {
            const children = db.categories
              .filter((c) => c.parentId === cat.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div
                key={cat.id}
                className="rounded-card bg-brand-surface border border-brand-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-green border border-brand-border">
                      <CategoryIcon name={cat.iconName} className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm font-extrabold text-brand-ink">
                          {cat.name}
                        </h4>
                        <span
                          className={`rounded-pill px-2 py-0.5 text-[10px] font-bold ${
                            cat.active
                              ? "bg-brand-green-soft text-brand-green-dark"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {cat.active ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      <p className="text-xs text-brand-ink-muted">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => reorderCategory(cat.id, "up")}
                      title="Subir orden"
                      className="rounded-full p-1.5 text-brand-ink hover:bg-white"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderCategory(cat.id, "down")}
                      title="Bajar orden"
                      className="rounded-full p-1.5 text-brand-ink hover:bg-white"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveCategory({ ...cat, active: !cat.active })
                      }
                      className="rounded-pill border border-brand-border bg-white px-2.5 py-1 text-[11px] font-bold text-brand-ink"
                    >
                      {cat.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(cat)}
                      className="rounded-full p-1.5 text-brand-ink hover:bg-white"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      className="rounded-full p-1.5 text-brand-ink-subtle hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategorías anidadas */}
                {children.length > 0 && (
                  <div className="pl-8 space-y-2 border-l-2 border-brand-green/30 ml-4">
                    {children.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between rounded-2xl bg-white p-2.5 border border-brand-border text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CategoryIcon
                            name={sub.iconName}
                            className="h-4 w-4 text-brand-green"
                          />
                          <span className="font-bold text-brand-ink">
                            {sub.name}
                          </span>
                          <span className="text-[11px] text-brand-ink-muted">
                            (Subcategoría)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(sub)}
                            className="p-1 text-brand-ink-muted hover:text-brand-green"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(sub.id)}
                            className="p-1 text-brand-ink-muted hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MÓDULO DE VENTAS E INGRESOS (CON EXPORTACIÓN CSV/EXCEL)
   ========================================================= */
export function SalesModule() {
  const { db } = useVitalSur();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d">("all");

  const filteredSales = useMemo(() => {
    const now = Date.now();
    return db.orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (methodFilter !== "all" && o.paymentMethod !== methodFilter)
        return false;
      if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : 30;
        const diff = now - new Date(o.createdAt).getTime();
        if (diff > days * 86400000) return false;
      }
      return true;
    });
  }, [db.orders, statusFilter, methodFilter, dateRange]);

  const totalRevenue = filteredSales.reduce((acc, o) => acc + o.total, 0);
  const totalCost = filteredSales.reduce((acc, o) => acc + o.estimatedCost, 0);
  const estimatedProfit = totalRevenue - totalCost;

  const handleExportSalesCsv = () => {
    const headers = [
      "Orden",
      "Fecha",
      "Cliente",
      "Localidad",
      "Estado",
      "MetodoPago",
      "SubtotalARS",
      "EnvioARS",
      "TotalARS",
      "CostoEstimadoARS",
      "GananciaEstimadaARS",
      "SeguimientoCorreoArgentino",
    ];
    const rows = filteredSales.map((o) =>
      [
        o.orderNumber,
        formatDateAR(o.createdAt),
        o.customerName,
        o.shippingCity,
        o.status,
        o.paymentMethod,
        o.subtotal,
        o.shippingCost,
        o.total,
        o.estimatedCost,
        o.total - o.estimatedCost,
        o.trackingNumber || "PENDIENTE",
      ].map(escapeCsvCell)
    );

    const csv =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vital-sur-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* KPIs Financieros */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
            Facturación Total (Filtro)
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-ink">
            {formatARS(totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">
            En {filteredSales.length} operaciones registradas
          </p>
        </div>

        <div className="rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-ink-muted">
            Costo de Mercadería Vendida
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-ink">
            {formatARS(totalCost)}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">
            Calculado según costo unitario por SKU
          </p>
        </div>

        <div className="rounded-card-lg bg-brand-green-soft/60 p-5 border border-brand-green/30 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-green-dark">
            Ganancia Neta Estimada
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-brand-green-dark">
            {formatARS(estimatedProfit)}
          </p>
          <p className="mt-1 text-xs font-semibold text-brand-green-dark">
            Margen bruto promedio:{" "}
            {totalRevenue > 0
              ? `${Math.round((estimatedProfit / totalRevenue) * 100)}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* Controles y Exportación */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card-lg bg-white p-4 border border-brand-border shadow-soft text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(e.target.value as "all" | "7d" | "30d")
            }
            className="rounded-pill border border-brand-border bg-brand-surface px-3.5 py-2 font-bold text-brand-ink"
          >
            <option value="all">Todas las fechas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "all")
            }
            className="rounded-pill border border-brand-border bg-brand-surface px-3.5 py-2 font-bold text-brand-ink"
          >
            <option value="all">Todos los estados</option>
            {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((st) => (
              <option key={st} value={st}>
                {ORDER_STATUS_META[st].label}
              </option>
            ))}
          </select>

          <select
            value={methodFilter}
            onChange={(e) =>
              setMethodFilter(e.target.value as PaymentMethod | "all")
            }
            className="rounded-pill border border-brand-border bg-brand-surface px-3.5 py-2 font-bold text-brand-ink"
          >
            <option value="all">Todos los medios de pago</option>
            <option value="mercado_pago">Mercado Pago</option>
            <option value="transferencia">Transferencia Bancaria</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleExportSalesCsv}
          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green px-4 py-2 font-bold text-white hover:bg-brand-green-dark"
        >
          <Download className="h-4 w-4" />
          <span>Exportar Reporte CSV / Excel</span>
        </button>
      </div>

      {/* Tabla de Historial de Ventas */}
      <div className="rounded-card-lg bg-white border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface text-brand-ink-muted">
                <th className="py-3 px-4 font-bold">Orden / Fecha</th>
                <th className="py-3 px-4 font-bold">Cliente</th>
                <th className="py-3 px-4 font-bold">Medio de Pago</th>
                <th className="py-3 px-4 font-bold">Estado</th>
                <th className="py-3 px-4 font-bold">Total Venta</th>
                <th className="py-3 px-4 font-bold text-right">
                  Ganancia Estimada
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-xs text-brand-ink-muted"
                  >
                    No hay ventas registradas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-brand-surface/50">
                  <td className="py-3 px-4">
                    <span className="font-display font-extrabold text-brand-ink block">
                      #{sale.orderNumber}
                    </span>
                    <span className="text-[11px] text-brand-ink-muted">
                      {formatDateTimeAR(sale.createdAt)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-brand-ink block">
                      {sale.customerName}
                    </span>
                    <span className="text-[11px] text-brand-ink-muted">
                      {sale.shippingCity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-brand-ink">
                    {sale.paymentMethod === "mercado_pago"
                      ? "Mercado Pago"
                      : "Transferencia"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-pill border px-2.5 py-0.5 text-[11px] font-bold ${
                        ORDER_STATUS_META[sale.status].badgeClass
                      }`}
                    >
                      {ORDER_STATUS_META[sale.status].label}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-display font-extrabold text-brand-ink">
                    {formatARS(sale.total)}
                  </td>
                  <td className="py-3 px-4 text-right font-display font-extrabold text-brand-green-dark">
                    +{formatARS(sale.total - sale.estimatedCost)}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MÓDULO DE CLIENTES (CRM CON HISTORIAL, NOTAS Y ETIQUETAS)
   ========================================================= */
export function CustomersModule() {
  const { db, updateCustomerDetails } = useVitalSur();

  const [selectedId, setSelectedId] = useState<string>(
    db.customers[0]?.id || ""
  );
  const selectedCustomer =
    db.customers.find((c) => c.id === selectedId) || db.customers[0];

  const [notesDraft, setNotesDraft] = useState(selectedCustomer?.notes || "");
  const [tagsDraft, setTagsDraft] = useState(
    selectedCustomer?.tags.join(", ") || ""
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const found = db.customers.find((c) => c.id === id);
    if (found) {
      setNotesDraft(found.notes);
      setTagsDraft(found.tags.join(", "));
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const tags = tagsDraft
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await updateCustomerDetails(selectedCustomer.id, notesDraft, tags);
  };

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return db.orders.filter(
      (o) =>
        o.customerId === selectedCustomer.id ||
        o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [db.orders, selectedCustomer]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Listado de Clientes */}
      <div className="lg:col-span-7 rounded-card-lg bg-white border border-brand-border shadow-soft overflow-hidden">
        <div className="p-5 border-b border-brand-border">
          <h2 className="font-display text-base font-extrabold text-brand-ink">
            Base de Clientes Vital Sur ({db.customers.length})
          </h2>
          <p className="text-xs text-brand-ink-muted">
            Seguimiento de compras acumuladas, etiquetas de segmentación y notas.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface text-brand-ink-muted">
                <th className="py-3 px-4 font-bold">Cliente</th>
                <th className="py-3 px-4 font-bold">Localidad</th>
                <th className="py-3 px-4 font-bold">Etiquetas</th>
                <th className="py-3 px-4 font-bold text-right">
                  Total Gastado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {db.customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-xs text-brand-ink-muted"
                  >
                    No hay clientes registrados aún. Se crearán automáticamente con las compras.
                  </td>
                </tr>
              ) : (
                db.customers.map((cust) => (
                <tr
                  key={cust.id}
                  onClick={() => handleSelect(cust.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedCustomer?.id === cust.id
                      ? "bg-brand-green-soft/40"
                      : "hover:bg-brand-surface/50"
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <p className="font-display font-bold text-brand-ink">
                      {cust.name}
                    </p>
                    <p className="text-[11px] text-brand-ink-muted">
                      {cust.email}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-brand-ink-muted">
                    {cust.city}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {cust.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-pill bg-brand-surface border border-brand-border px-2 py-0.5 text-[10px] font-bold text-brand-ink"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-display font-extrabold text-brand-green-dark block">
                      {formatARS(cust.totalSpent)}
                    </span>
                    <span className="text-[10px] text-brand-ink-muted">
                      {cust.ordersCount}{" "}
                      {cust.ordersCount === 1 ? "compra" : "compras"}
                    </span>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ficha CRM del Cliente */}
      <div className="lg:col-span-5">
        {selectedCustomer && (
          <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-5 text-xs">
            <div className="border-b border-brand-border pb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green">
                Ficha de Cliente
              </span>
              <h3 className="font-display text-lg font-extrabold text-brand-ink">
                {selectedCustomer.name}
              </h3>
              <p className="text-brand-ink-muted mt-0.5">
                {selectedCustomer.email} · {selectedCustomer.phone} · DNI{" "}
                {selectedCustomer.dni}
              </p>
              <p className="text-brand-ink-muted mt-0.5">
                Dirección: {selectedCustomer.address}, {selectedCustomer.city}
              </p>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block font-bold text-brand-ink mb-1">
                  Etiquetas de Segmentación (separadas por coma)
                </label>
                <input
                  type="text"
                  value={tagsDraft}
                  onChange={(e) => setTagsDraft(e.target.value)}
                  placeholder="Frecuente, Zona Sur, Fuerza"
                  className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-ink mb-1">
                  Notas de Atención al Cliente
                </label>
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="w-full rounded-2xl border border-brand-border bg-brand-surface p-3 text-brand-ink"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-pill bg-brand-green py-2.5 px-4 font-bold text-white hover:bg-brand-green-dark"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Notas y Etiquetas</span>
              </button>
            </form>

            {/* Historial de Compras */}
            <div className="border-t border-brand-border pt-4">
              <h4 className="font-extrabold uppercase tracking-wider text-brand-ink mb-2">
                Historial de Pedidos ({customerOrders.length})
              </h4>
              <div className="space-y-2">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-2xl bg-brand-surface p-3 border border-brand-border"
                  >
                    <div>
                      <span className="font-bold text-brand-ink">
                        #{ord.orderNumber}
                      </span>
                      <span className="block text-[11px] text-brand-ink-muted">
                        {formatDateAR(ord.createdAt)} ·{" "}
                        {ORDER_STATUS_META[ord.status].label}
                      </span>
                    </div>
                    <span className="font-display font-extrabold text-brand-green-dark">
                      {formatARS(ord.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MÓDULO DE INVENTARIO Y MOVIMIENTOS DE STOCK
   ========================================================= */
export function InventoryModule() {
  const { db, adjustProductStock } = useVitalSur();

  const [selectedProductId, setSelectedProductId] = useState(
    db.products[0]?.id || ""
  );
  const [delta, setDelta] = useState<number>(10);
  const [reason, setReason] = useState(
    "Reposición de lote en depósito Florencio Varela"
  );

  const lowStockProducts = db.products.filter((p) => p.stock <= p.minStock);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || delta === 0) return;
    await adjustProductStock(selectedProductId, delta, reason);
  };

  return (
    <div className="space-y-6">
      {/* Alertas de Stock Mínimo */}
      {lowStockProducts.length > 0 && (
        <div className="rounded-card-lg bg-amber-50/90 border border-amber-200 p-5">
          <div className="flex items-center gap-2.5 text-amber-900 font-display text-sm font-extrabold mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-700" strokeWidth={2} />
            <span>
              Alertas de Stock Mínimo ({lowStockProducts.length} productos por
              debajo del umbral)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-amber-200 text-xs"
              >
                <div>
                  <p className="font-bold text-brand-ink">{prod.name}</p>
                  <p className="text-amber-800 font-semibold">
                    Stock actual: {prod.stock} u. (Mínimo: {prod.minStock} u.)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    adjustProductStock(
                      prod.id,
                      15,
                      "Reposición rápida desde alerta de stock mínimo"
                    )
                  }
                  className="rounded-pill bg-brand-green px-3 py-1.5 text-[11px] font-bold text-white hover:bg-brand-green-dark shrink-0"
                >
                  +15 u.
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Formulario de Ajuste Manual */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleAdjust}
            className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4 text-xs"
          >
            <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
              Ajuste Manual de Stock
            </h2>

            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Seleccionar Producto
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={db.products.length === 0}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-xs font-bold text-brand-ink disabled:opacity-60"
              >
                {db.products.length === 0 ? (
                  <option value="">No hay productos cargados</option>
                ) : (
                  db.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name} (Actual: {p.stock} u.)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Cantidad a sumar (positivo) o restar (negativo)
              </label>
              <input
                type="number"
                required
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-sm font-bold text-brand-ink"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Motivo del Movimiento
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-pill bg-brand-green py-3 px-5 font-bold text-white hover:bg-brand-green-dark"
            >
              Registrar Movimiento de Inventario
            </button>
          </form>
        </div>

        {/* Historial de Movimientos (Kardex) */}
        <div className="lg:col-span-7 rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
          <h3 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
            Historial de Movimientos de Stock ({db.stockMovements.length})
          </h3>
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {db.stockMovements.length === 0 ? (
              <div className="rounded-2xl bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
                No hay movimientos de stock registrados todavía.
              </div>
            ) : (
              db.stockMovements.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center justify-between rounded-2xl bg-brand-surface p-3.5 border border-brand-border text-xs"
                >
                  <div>
                    <span className="font-mono text-[11px] font-bold text-brand-green-dark">
                      {mov.sku} · {mov.type}
                    </span>
                    <p className="font-bold text-brand-ink">{mov.productName}</p>
                    <p className="text-[11px] text-brand-ink-muted">
                      {mov.reason} · Por {mov.createdBy} (
                      {formatDateTimeAR(mov.createdAt)})
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-display text-sm font-extrabold ${
                        mov.quantity > 0 ? "text-brand-green-dark" : "text-red-600"
                      }`}
                    >
                      {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} u.
                    </span>
                    <span className="block text-[10px] text-brand-ink-muted">
                      {mov.previousStock} → {mov.newStock} u.
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MÓDULO DE CUPONES Y PROMOCIONES
   ========================================================= */
export function CouponsModule() {
  const { db, saveCoupon, deleteCoupon } = useVitalSur();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(30000);
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAt, setExpiresAt] = useState("2027-06-30");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: code.trim().toUpperCase(),
      description: description || "Promoción exclusiva Vital Sur",
      discountType,
      discountValue,
      minPurchase,
      maxUses,
      usedCount: 0,
      expiresAt,
      active: true,
    };
    await saveCoupon(newCoupon);
    setCode("");
    setDescription("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <form
          onSubmit={handleCreate}
          className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4 text-xs"
        >
          <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
            Crear Cupón de Descuento
          </h2>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Código del Cupón *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ENTRENASUR20"
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-sm font-mono font-bold text-brand-ink uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Tipo de Descuento
              </label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")
                }
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3 py-2 font-bold text-brand-ink"
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED">Monto Fijo ($ ARS)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Valor ({discountType === "PERCENTAGE" ? "%" : "ARS"})
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3 py-2 font-bold text-brand-ink"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Compra Mínima (ARS)
              </label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3 py-2 font-bold text-brand-ink"
              />
            </div>
            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Límite de Usos
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3 py-2 font-bold text-brand-ink"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3 py-2 font-bold text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Beneficio para gimnasios adheridos"
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3 py-2 text-brand-ink"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-pill bg-brand-green py-3 px-4 font-bold text-white hover:bg-brand-green-dark"
          >
            <Plus className="h-4 w-4" />
            <span>Activar Nuevo Cupón</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 space-y-3">
        {db.coupons.length === 0 ? (
          <div className="rounded-card-lg bg-white p-8 text-center border border-brand-border text-xs text-brand-ink-muted">
            No hay cupones creados aún. Usá el formulario a la izquierda para crear tu primer cupón o código de descuento.
          </div>
        ) : (
          db.coupons.map((coup) => (
            <div
              key={coup.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-card-lg bg-white p-5 border border-brand-border shadow-soft text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-green-soft text-brand-green-dark">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-brand-ink">
                      {coup.code}
                    </span>
                    <span className="rounded-pill bg-brand-green-soft px-2.5 py-0.5 text-[11px] font-extrabold text-brand-green-dark">
                      {coup.discountType === "PERCENTAGE"
                        ? `${coup.discountValue}% OFF`
                        : `-${formatARS(coup.discountValue)}`}
                    </span>
                  </div>
                  <p className="text-brand-ink-muted mt-0.5">
                    {coup.description}
                  </p>
                  <p className="text-[11px] font-semibold text-brand-ink-subtle mt-1">
                    Mínimo: {formatARS(coup.minPurchase)} · Usos: {coup.usedCount}/
                    {coup.maxUses} · Vence: {coup.expiresAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() =>
                    saveCoupon({ ...coup, active: !coup.active })
                  }
                  className={`rounded-pill px-3 py-1.5 font-bold ${
                    coup.active
                      ? "bg-brand-green-soft text-brand-green-dark"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {coup.active ? "Activo" : "Pausado"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCoupon(coup.id)}
                  className="rounded-full p-2 text-brand-ink-subtle hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MÓDULO DE CONFIGURACIÓN CENTRALIZADA (ENVÍOS, PAGOS, TEXTOS)
   ========================================================= */
export function SettingsModule() {
  const { db, currentUser, updateStoreSettings, resetDemoDatabase } =
    useVitalSur();
  const [form, setForm] = useState(db.settings);

  const isCollaborator = currentUser?.role === "COLLABORATOR";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreSettings(form);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs">
      {isCollaborator && (
        <div className="flex items-center gap-3 rounded-card bg-amber-50 border border-amber-200 p-4 text-amber-900">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" />
          <p className="font-semibold">
            Estás conectado con el rol <strong>Colaborador</strong>. Podés
            visualizar los parámetros de la tienda o cambiar al rol{" "}
            <strong>Administrador</strong> desde el menú superior para guardar
            cambios críticos.
          </p>
        </div>
      )}

      {/* 1. Reglas Centralizadas de Envío Correo Argentino */}
      <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2.5 border-b border-brand-border pb-3">
          <Truck className="h-5 w-5 text-brand-green" strokeWidth={2} />
          <div>
            <h2 className="font-display text-base font-extrabold text-brand-ink">
              Reglas de Envío y Umbral de Envío Gratis (Tiempo Real)
            </h2>
            <p className="text-brand-ink-muted">
              Cualquier cambio acá impacta de inmediato en la barra de progreso
              del carrito y en el checkout.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Operador Logístico Nacional
            </label>
            <input
              type="text"
              value={form.shippingCarrier}
              onChange={(e) =>
                setForm({ ...form, shippingCarrier: e.target.value })
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2.5 font-bold text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Costo de Envío Fijo (ARS)
            </label>
            <input
              type="number"
              required
              value={form.shippingCost}
              onChange={(e) =>
                setForm({ ...form, shippingCost: Number(e.target.value) })
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-sm font-extrabold text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Monto Mínimo para Envío GRATIS (ARS)
            </label>
            <input
              type="number"
              required
              value={form.freeShippingThreshold}
              onChange={(e) =>
                setForm({
                  ...form,
                  freeShippingThreshold: Number(e.target.value),
                })
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-green-soft/50 px-3.5 py-2.5 text-sm font-extrabold text-brand-green-dark"
            />
          </div>
        </div>
      </div>

      {/* 2. Datos del Negocio y Contacto en Florencio Varela */}
      <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
        <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
          Datos del Negocio, Redes y WhatsApp (Florencio Varela)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Dirección Física en Florencio Varela
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Teléfono Público
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Número de WhatsApp (Formato internacional sin +)
            </label>
            <input
              type="text"
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm({ ...form, whatsappNumber: e.target.value })
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 font-mono font-bold text-brand-ink"
            />
          </div>
        </div>
      </div>

      {/* 3. Textos del Home y Medios de Pago */}
      <div className="rounded-card-lg bg-white border border-brand-border p-6 shadow-soft space-y-4">
        <h2 className="font-display text-base font-extrabold text-brand-ink border-b border-brand-border pb-3">
          Textos del Home y Configuración de Pagos
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Título Principal del Hero (100svh)
            </label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 font-bold text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Subtítulo del Hero
            </label>
            <textarea
              rows={2}
              value={form.heroSubtitle}
              onChange={(e) =>
                setForm({ ...form, heroSubtitle: e.target.value })
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-surface p-3 text-brand-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Public Key Mercado Pago (Modo Prueba)
            </label>
            <input
              type="text"
              value={form.mpPublicKey}
              onChange={(e) =>
                setForm({ ...form, mpPublicKey: e.target.value })
              }
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 font-mono text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              Alias Transferencia Bancaria
            </label>
            <input
              type="text"
              value={form.bankAlias}
              onChange={(e) => setForm({ ...form, bankAlias: e.target.value })}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 font-mono font-bold text-brand-ink"
            />
          </div>
          <div>
            <label className="block font-bold text-brand-ink mb-1">
              CBU / CVU Oficial
            </label>
            <input
              type="text"
              value={form.bankCbu}
              onChange={(e) => setForm({ ...form, bankCbu: e.target.value })}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 font-mono text-brand-ink"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={resetDemoDatabase}
          className="rounded-pill border border-brand-border bg-white px-5 py-3 font-bold text-brand-ink-muted hover:text-brand-ink"
        >
          Restaurar base de datos de ejemplo original
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-pill bg-brand-green px-8 py-3.5 text-sm font-bold text-white hover:bg-brand-green-dark shadow-soft"
        >
          <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
          <span>Guardar Toda la Configuración</span>
        </button>
      </div>
    </form>
  );
}

