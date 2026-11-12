"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  TrendingUp,
  Users,
  Boxes,
  TicketPercent,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Bell,
  AlertTriangle,
  Lock,
  UserCheck,
  Sparkles,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { VitalSurLogo } from "@/components/brand/VitalSurLogo";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";
import { AnimatedCounter } from "@/components/admin/AnimatedCounter";
import { OrdersModule, ORDER_STATUS_META } from "@/components/admin/OrdersModule";
import { ProductsModule } from "@/components/admin/ProductsModule";
import {
  CategoriesModule,
  SalesModule,
  CustomersModule,
  InventoryModule,
  CouponsModule,
  SettingsModule,
} from "@/components/admin/CrmSecondaryModules";

type CrmSection =
  | "dashboard"
  | "pedidos"
  | "productos"
  | "categorias"
  | "ventas"
  | "clientes"
  | "inventario"
  | "cupones"
  | "configuracion";

export default function AdminCrmPage() {
  const {
    db,
    currentUser,
    loginStaff,
    logoutStaff,
    unreadOrdersCount,
    simulateIncomingRealtimeOrder,
  } = useVitalSur();

  const [activeSection, setActiveSection] = useState<CrmSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Estado formulario de Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await loginStaff(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!res.ok) {
      setLoginError(res.message);
    } else {
      setLoginError(null);
    }
  };

  // Métricas del Dashboard
  const metrics = useMemo(() => {
    const validOrders = db.orders.filter((o) => o.status !== "cancelado");
    const monthTotal = validOrders.reduce((acc, o) => acc + o.total, 0);
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = validOrders.filter((o) =>
      o.createdAt.startsWith(todayStr)
    );
    const todayTotal = todayOrders.reduce((acc, o) => acc + o.total, 0);

    const weekOrders = validOrders.slice(0, 4);
    const weekTotal = weekOrders.reduce((acc, o) => acc + o.total, 0);

    const avgTicket =
      validOrders.length > 0
        ? Math.round(monthTotal / validOrders.length)
        : 0;

    const topProducts = [...db.products]
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 5);

    const lowStockProducts = db.products.filter((p) => p.stock <= p.minStock);

    return {
      todayTotal,
      weekTotal,
      monthTotal,
      avgTicket,
      totalOrders: db.orders.length,
      newOrders: db.orders.filter((o) => o.status === "nuevo").length,
      topProducts,
      lowStockProducts,
    };
  }, [db.orders, db.products]);

  // Datos para el gráfico vectorial calculados desde los últimos 7 días reales (Hook ejecutado siempre al inicio)
  const weeklyChartBars = useMemo(() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const now = new Date();
    const dayTotals: { day: string; amount: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = i === 0 ? "Hoy" : (days[d.getDay()] || "Día");
      const dayOrders = db.orders.filter(
        (o) => o.status !== "cancelado" && o.createdAt.startsWith(dateStr)
      );
      const amount = dayOrders.reduce((sum, o) => sum + o.total, 0);
      dayTotals.push({ day: dayLabel, amount });
    }

    const highest = Math.max(...dayTotals.map((d) => d.amount), 1);
    return dayTotals.map((d) => ({
      day: d.day,
      amount: d.amount,
      pct: d.amount > 0 ? Math.max(12, Math.round((d.amount / highest) * 100)) : 6,
    }));
  }, [db.orders]);

  const navItems: {
    id: CrmSection;
    label: string;
    icon: LucideIcon;
    badge?: number;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "pedidos",
      label: "Pedidos",
      icon: ShoppingCart,
      badge: unreadOrdersCount,
    },
    { id: "productos", label: "Productos", icon: Package },
    { id: "categorias", label: "Categorías", icon: FolderTree },
    { id: "ventas", label: "Ventas", icon: TrendingUp },
    { id: "clientes", label: "Clientes", icon: Users },
    {
      id: "inventario",
      label: "Inventario",
      icon: Boxes,
      badge: metrics.lowStockProducts.length,
    },
    { id: "cupones", label: "Cupones", icon: TicketPercent },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  // Pantalla de Login Protegido si no hay sesión
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-brand-surface px-4 py-12">
        <div className="w-full max-w-md rounded-card-lg bg-white border border-brand-border p-8 shadow-soft-md space-y-6 animate-fade-slide">
          <div className="flex flex-col items-center text-center">
            <VitalSurLogo variant="vertical" size="sm" />
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-brand-green-soft px-3.5 py-1 text-xs font-extrabold text-brand-green-dark">
              <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              Panel de Administración y CRM
            </span>
            <p className="mt-2 text-xs text-brand-ink-muted">
              Ingresá con tus credenciales de equipo para gestionar pedidos,
              catálogo, categorías y stock.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Correo Electrónico Corporativo
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-brand-ink mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-2xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
              />
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-red-600">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-pill bg-brand-ink py-3.5 px-6 text-sm font-bold text-white hover:bg-brand-green transition-colors"
            >
              Ingresar al Panel CRM
            </button>
          </form>

          <div className="pt-2 border-t border-brand-border text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green-dark hover:underline"
            >
              <span>Volver a la tienda pública de Vital Sur</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-brand-surface text-brand-ink">
      {/* Sidebar Colapsable */}
      <aside
        className={`no-print flex flex-col justify-between bg-white border-r border-brand-border transition-all duration-300 ease-natural shrink-0 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Logo y botón colapsar */}
          <div className="flex items-center justify-between">
            {sidebarCollapsed ? (
              <VitalSurLogo variant="isotipo" size="sm" />
            ) : (
              <VitalSurLogo variant="horizontal" size="sm" />
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={
                sidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
              }
              className="rounded-full p-1.5 text-brand-ink-muted hover:bg-brand-surface hover:text-brand-ink"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
              )}
            </button>
          </div>

          {/* Navegación de módulos CRM */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-brand-green text-white shadow-sm"
                      : "text-brand-ink hover:bg-brand-surface hover:text-brand-green"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && item.badge > 0 ? (
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[10px] font-extrabold ${
                        isActive
                          ? "bg-white text-brand-green-dark"
                          : "bg-brand-blue-light text-brand-blue-dark"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pie del Sidebar: Usuario y Enlace a Tienda */}
        <div className="p-4 border-t border-brand-border space-y-3">
          {!sidebarCollapsed && (
            <div className="rounded-2xl bg-brand-surface p-3 border border-brand-border text-xs">
              <p className="font-bold text-brand-ink truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-brand-green-dark font-semibold">
                {currentUser.roleLabel}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-pill border border-brand-border bg-brand-surface py-2 px-3 text-xs font-bold text-brand-ink hover:border-brand-green"
            >
              <ExternalLink className="h-3.5 w-3.5 text-brand-green" />
              {!sidebarCollapsed && <span>Ver Tienda Pública</span>}
            </Link>
            <button
              type="button"
              onClick={logoutStaff}
              className="flex items-center justify-center gap-2 rounded-pill py-2 px-3 text-xs font-bold text-brand-ink-muted hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Área Principal de Contenido CRM */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar del CRM */}
        <header className="no-print sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-md border-b border-brand-border px-6 py-3.5">
          <div>
            <h1 className="font-display text-lg sm:text-xl font-extrabold text-brand-ink capitalize">
              {navItems.find((n) => n.id === activeSection)?.label} — Vital Sur
              CRM
            </h1>
            <p className="text-xs text-brand-ink-muted">
              Sede Florencio Varela · Envío fijo Correo Argentino:{" "}
              <strong>{formatARS(db.settings.shippingCost)}</strong> (Gratis
              superando{" "}
              <strong>{formatARS(db.settings.freeShippingThreshold)}</strong>)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Indicador de Rol Activo */}
            <span
              title="Rol de la sesión autenticada"
              className="inline-flex items-center gap-1.5 rounded-pill border border-brand-border bg-brand-surface px-3.5 py-1.5 text-xs font-bold text-brand-ink"
            >
              <UserCheck className="h-3.5 w-3.5 text-brand-green" />
              <span>Rol: {currentUser.role}</span>
            </span>

            {/* Botón de notificaciones de pedidos */}
            <button
              type="button"
              onClick={() => setActiveSection("pedidos")}
              className="relative inline-flex items-center gap-2 rounded-pill bg-brand-green-soft px-3.5 py-1.5 text-xs font-extrabold text-brand-green-dark hover:bg-brand-green hover:text-white transition-colors"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
              <span>Pedidos Nuevos: {unreadOrdersCount}</span>
            </button>
          </div>
        </header>

        {/* Contenido Dinámico del Módulo Activo */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeSection === "dashboard" && (
            <div className="space-y-6 animate-fade-slide">
              {/* Tarjetas KPI con Contadores Animados */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-ink-muted">
                    <span>VENTAS DEL DÍA</span>
                    <span className="rounded-pill bg-brand-green-soft px-2 py-0.5 text-[10px] font-extrabold text-brand-green-dark">
                      Hoy
                    </span>
                  </div>
                  <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
                    <AnimatedCounter value={metrics.todayTotal} isCurrency />
                  </p>
                  <p className="mt-1 text-xs text-brand-green-dark font-semibold flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>+14% respecto al promedio diario</span>
                  </p>
                </div>

                <div className="rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-ink-muted">
                    <span>VENTAS DE LA SEMANA</span>
                    <span className="rounded-pill bg-brand-blue-light px-2 py-0.5 text-[10px] font-extrabold text-brand-blue-dark">
                      7 días
                    </span>
                  </div>
                  <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
                    <AnimatedCounter value={metrics.weekTotal} isCurrency />
                  </p>
                  <p className="mt-1 text-xs text-brand-ink-muted">
                    En tienda web y punto Varela
                  </p>
                </div>

                <div className="rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-ink-muted">
                    <span>VENTAS DEL MES</span>
                    <span className="rounded-pill bg-brand-green-soft px-2 py-0.5 text-[10px] font-extrabold text-brand-green-dark">
                      Acumulado
                    </span>
                  </div>
                  <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-brand-green-dark">
                    <AnimatedCounter value={metrics.monthTotal} isCurrency />
                  </p>
                  <p className="mt-1 text-xs text-brand-ink-muted">
                    {metrics.totalOrders} pedidos registrados
                  </p>
                </div>

                <div className="rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-ink-muted">
                    <span>TICKET PROMEDIO</span>
                    <span className="rounded-pill bg-brand-surface border border-brand-border px-2 py-0.5 text-[10px] font-extrabold text-brand-ink">
                      ARS
                    </span>
                  </div>
                  <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
                    <AnimatedCounter value={metrics.avgTicket} isCurrency />
                  </p>
                  <p className="mt-1 text-xs text-brand-ink-muted">
                    Umbral envío gratis:{" "}
                    {formatARS(db.settings.freeShippingThreshold)}
                  </p>
                </div>
              </div>

              {/* Gráficos Vectoriales Limpios y Ranking de Productos */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Gráfico de Ingresos Semanales con paleta de marca */}
                <div className="lg:col-span-7 rounded-card-lg bg-white p-6 border border-brand-border shadow-soft flex flex-col justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <div>
                      <h2 className="font-display text-base font-extrabold text-brand-ink">
                        Evolución de Ventas Semanales (ARS)
                      </h2>
                      <p className="text-xs text-brand-ink-muted">
                        Facturación diaria en pesos argentinos durante los
                        últimos 7 días
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={simulateIncomingRealtimeOrder}
                      className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green-soft px-3.5 py-1.5 text-xs font-bold text-brand-green-dark hover:bg-brand-green hover:text-white transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Simular Nuevo Pedido</span>
                    </button>
                  </div>

                  {/* Barras SVG limpias */}
                  <div className="grid grid-cols-7 gap-3 items-end h-52 pt-6 px-2 border-b border-brand-border">
                    {weeklyChartBars.map((bar, idx) => {
                      const isToday = idx === weeklyChartBars.length - 1;
                      return (
                        <div
                          key={bar.day}
                          className="flex flex-col items-center justify-end h-full group"
                        >
                          <span className="mb-1.5 text-[10px] font-bold text-brand-ink-muted group-hover:text-brand-ink">
                            {formatARS(bar.amount)}
                          </span>
                          <div
                            className={`w-full max-w-[44px] rounded-t-xl transition-all duration-500 ${
                              isToday
                                ? "bg-brand-green"
                                : "bg-brand-blue hover:bg-brand-green-light"
                            }`}
                            style={{ height: `${bar.pct}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-7 gap-3 pt-2.5 text-center text-xs font-bold text-brand-ink-muted">
                    {weeklyChartBars.map((bar) => (
                      <span key={bar.day}>{bar.day}</span>
                    ))}
                  </div>
                </div>

                {/* Productos Más Vendidos */}
                <div className="lg:col-span-5 rounded-card-lg bg-white p-6 border border-brand-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-extrabold text-brand-ink">
                      Productos Más Vendidos
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection("productos")}
                      className="text-xs font-bold text-brand-green hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="space-y-3">
                    {metrics.topProducts.length === 0 ? (
                      <div className="rounded-2xl bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
                        Aún no hay productos con ventas registradas.
                      </div>
                    ) : (
                      metrics.topProducts.map((prod, idx) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-brand-surface p-3 border border-brand-border/70 text-xs"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green text-white font-extrabold">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-brand-ink truncate">
                                {prod.name}
                              </p>
                              <p className="text-[11px] text-brand-ink-muted">
                                {prod.soldCount} unidades vendidas
                              </p>
                            </div>
                          </div>
                          <span className="font-display font-extrabold text-brand-ink shrink-0">
                            {formatARS(prod.salePrice ?? prod.price)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Últimos Pedidos y Alertas de Stock Bajo */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7 rounded-card-lg bg-white p-6 border border-brand-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-extrabold text-brand-ink">
                      Últimos Pedidos Recibidos
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection("pedidos")}
                      className="text-xs font-bold text-brand-green hover:underline"
                    >
                      Gestionar pedidos
                    </button>
                  </div>

                  <div className="divide-y divide-brand-border/60 text-xs">
                    {db.orders.length === 0 ? (
                      <div className="rounded-2xl bg-brand-surface p-6 text-center text-xs text-brand-ink-muted">
                        No hay pedidos recibidos todavía. Cuando los clientes compren en la tienda, aparecerán aquí en tiempo real.
                      </div>
                    ) : (
                      db.orders.slice(0, 4).map((ord) => (
                        <div
                          key={ord.id}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-extrabold text-brand-ink">
                                #{ord.orderNumber}
                              </span>
                              <span
                                className={`rounded-pill border px-2 py-0.5 text-[10px] font-bold ${
                                  ORDER_STATUS_META[ord.status].badgeClass
                                }`}
                              >
                                {ORDER_STATUS_META[ord.status].label}
                              </span>
                            </div>
                            <p className="text-brand-ink-muted mt-0.5">
                              {ord.customerName} · {ord.shippingCity}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-display font-extrabold text-brand-ink block">
                              {formatARS(ord.total)}
                            </span>
                            <span className="text-[10px] text-brand-ink-muted">
                              {ord.shippingCost === 0
                                ? "Envío Gratis"
                                : `Envío ${formatARS(ord.shippingCost)}`}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Alertas de Stock Bajo */}
                <div className="lg:col-span-5 rounded-card-lg bg-white p-6 border border-brand-border shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-extrabold text-brand-ink flex items-center gap-2">
                      <AlertTriangle
                        className="h-4 w-4 text-amber-600"
                        strokeWidth={2}
                      />
                      <span>Alertas de Stock Mínimo</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection("inventario")}
                      className="text-xs font-bold text-brand-green hover:underline"
                    >
                      Reponer stock
                    </button>
                  </div>

                  {metrics.lowStockProducts.length === 0 ? (
                    <p className="text-xs text-brand-ink-muted">
                      Todos los productos superan el stock mínimo configurado.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {metrics.lowStockProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between rounded-2xl bg-amber-50/70 border border-amber-200 p-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-brand-ink">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-amber-800 font-semibold">
                              SKU {prod.sku} · Mínimo requerido: {prod.minStock}{" "}
                              u.
                            </p>
                          </div>
                          <span className="rounded-pill bg-white border border-amber-300 px-3 py-1 font-extrabold text-amber-900">
                            Quedan {prod.stock} u.
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "pedidos" && <OrdersModule />}
          {activeSection === "productos" && <ProductsModule />}
          {activeSection === "categorias" && <CategoriesModule />}
          {activeSection === "ventas" && <SalesModule />}
          {activeSection === "clientes" && <CustomersModule />}
          {activeSection === "inventario" && <InventoryModule />}
          {activeSection === "cupones" && <CouponsModule />}
          {activeSection === "configuracion" && <SettingsModule />}
        </main>
      </div>
    </div>
  );
}
