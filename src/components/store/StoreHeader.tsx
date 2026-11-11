"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Truck,
  MessageCircle,
} from "lucide-react";
import { VitalSurLogo } from "@/components/brand/VitalSurLogo";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";

export function StoreHeader() {
  const {
    db,
    cartCount,
    setIsCartOpen,
    lastAddedItemName,
  } = useVitalSur();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push("/productos");
      return;
    }
    router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Catálogo" },
    { href: "/#categorias", label: "Categorías" },
    { href: "/#quienes-somos", label: "Quiénes Somos" },
    { href: "/#preguntas", label: "Preguntas" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border/90 transition-all duration-200 no-print">
      {/* Barra superior informativa: solo envío gratis arriba de $80.000 sin precio fijo */}
      <div className="bg-brand-surface border-b border-brand-border/60 py-1.5 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] font-semibold text-brand-ink-muted">
          <div className="flex items-center gap-2 truncate">
            <Truck
              className="h-3.5 w-3.5 shrink-0 text-brand-green"
              strokeWidth={2}
            />
            <span className="truncate">
              Envíos a todo el país por{" "}
              <strong className="text-brand-ink">
                {db.settings.shippingCarrier}
              </strong>{" "}
              ·{" "}
              <strong className="text-brand-green-dark">
                ENVÍO GRATIS en compras superiores a{" "}
                {formatARS(db.settings.freeShippingThreshold)}
              </strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span>Florencio Varela, GBA Sur (Tienda Online)</span>
            <span className="text-brand-border">|</span>
            <a
              href={`https://wa.me/${db.settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brand-green-dark hover:text-brand-green transition-colors font-bold"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
              <span>WhatsApp: +54 9 11 3406-2942</span>
            </a>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo Vital Sur - Garantizado shrink-0 y sin rotura */}
        <Link
          href="/"
          aria-label="Vital Sur - Ir al inicio"
          className="shrink-0 flex items-center focus:outline-none"
        >
          <VitalSurLogo variant="horizontal" size="sm" />
        </Link>

        {/* Navegación Desktop */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-1 shrink-0"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-pill px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-brand-green-soft text-brand-green-dark"
                    : "text-brand-ink hover:bg-brand-surface hover:text-brand-green"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Buscador y Carrito */}
        <div className="flex items-center gap-2.5 shrink-0">
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex items-center relative"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proteína, creatina..."
              aria-label="Buscar productos"
              className="w-44 xl:w-56 rounded-pill border border-brand-border bg-brand-surface py-1.5 pl-9 pr-3.5 text-xs font-medium text-brand-ink placeholder:text-brand-ink-subtle focus:border-brand-green focus:bg-white focus:outline-none transition-all duration-200"
            />
            <Search
              className="absolute left-3 h-3.5 w-3.5 text-brand-ink-subtle pointer-events-none"
              strokeWidth={2}
            />
          </form>

          {/* Botón Carrito con contador animado */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Abrir carrito con ${cartCount} productos`}
            className={`relative inline-flex items-center gap-2 rounded-pill px-4 py-2 text-xs font-bold text-white transition-all duration-200 shadow-sm ${
              lastAddedItemName
                ? "bg-brand-green-dark scale-105"
                : "bg-brand-green hover:bg-brand-green-dark"
            }`}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Carrito</span>
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-extrabold text-brand-green-dark">
              {cartCount}
            </span>
          </button>

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
            className="lg:hidden inline-flex items-center justify-center rounded-full p-2 text-brand-ink hover:bg-brand-surface"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Menú desplegable Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-slide">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar suplementos..."
              className="w-full rounded-pill border border-brand-border bg-brand-surface py-2 pl-9 pr-4 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
            />
            <Search
              className="absolute left-3.5 top-2.5 h-4 w-4 text-brand-ink-subtle"
              strokeWidth={2}
            />
          </form>
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-brand-surface px-3.5 py-2.5 text-sm font-semibold text-brand-ink hover:bg-brand-green-soft hover:text-brand-green-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
