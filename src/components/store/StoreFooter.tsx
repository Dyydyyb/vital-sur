"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  Instagram,
  Facebook,
  ArrowUpRight,
} from "lucide-react";
import { VitalSurLogo } from "@/components/brand/VitalSurLogo";
import { WhatsAppSvg } from "@/components/brand/CategoryIcon";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";

export function StoreFooter() {
  const { db } = useVitalSur();

  const whatsappUrl = `https://wa.me/${db.settings.whatsappNumber}?text=${encodeURIComponent(
    "Hola Vital Sur! Les escribo desde la tienda web para hacer una consulta sobre suplementos."
  )}`;

  return (
    <footer className="bg-brand-surface border-t border-brand-border text-brand-ink no-print">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Columna 1: Identidad de marca */}
          <div className="lg:col-span-4 space-y-4">
            <VitalSurLogo variant="horizontal" size="md" />
            <p className="text-sm text-brand-ink-muted leading-relaxed max-w-sm">
              {db.settings.tagline}. Seleccionamos suplementos deportivos y
              fórmulas naturales con trazabilidad garantizada para acompañar tu
              entrenamiento y bienestar diario.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-white border border-brand-border px-3 py-1 text-xs font-semibold text-brand-ink">
                <ShieldCheck
                  className="h-4 w-4 text-brand-green"
                  strokeWidth={2}
                />
                Suplementos Originales
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-white border border-brand-border px-3 py-1 text-xs font-semibold text-brand-ink">
                <Truck
                  className="h-4 w-4 text-brand-blue-dark"
                  strokeWidth={2}
                />
                {db.settings.shippingCarrier}
              </span>
            </div>
          </div>

          {/* Columna 2: Categorías */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-brand-ink">
              Categorías
            </h3>
            <ul className="space-y-2 text-sm text-brand-ink-muted">
              {db.categories
                .filter((c) => c.parentId === null && c.active)
                .slice(0, 6)
                .map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/productos?categoria=${cat.slug}`}
                      className="hover:text-brand-green transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Columna 3: Enlaces útiles */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-brand-ink">
              Atención al Cliente
            </h3>
            <ul className="space-y-2 text-sm text-brand-ink-muted">
              <li>
                <Link
                  href="/productos"
                  className="hover:text-brand-green transition-colors"
                >
                  Catálogo completo
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="hover:text-brand-green transition-colors"
                >
                  Mi carrito de compras
                </Link>
              </li>
              <li>
                <Link
                  href="/#quienes-somos"
                  className="hover:text-brand-green transition-colors"
                >
                  Historia de Vital Sur (Varela)
                </Link>
              </li>
              <li>
                <Link
                  href="/#identidad-marca"
                  className="hover:text-brand-green transition-colors"
                >
                  Manual de Identidad y Logos SVG
                </Link>
              </li>
              <li>
                <Link
                  href="/#preguntas"
                  className="hover:text-brand-green transition-colors"
                >
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto en Florencio Varela */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-brand-ink">
              Contacto en Zona Sur
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-ink-muted">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="h-4 w-4 shrink-0 text-brand-green mt-0.5"
                  strokeWidth={2}
                />
                <span>{db.settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-brand-green"
                  strokeWidth={2}
                />
                <span>{db.settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail
                  className="h-4 w-4 shrink-0 text-brand-green"
                  strokeWidth={2}
                />
                <span>{db.settings.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock
                  className="h-4 w-4 shrink-0 text-brand-green"
                  strokeWidth={2}
                />
                <span>Lunes a Sábados de 9:00 a 20:00 hs</span>
              </li>
            </ul>

            {/* Redes sociales con íconos SVG */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-green-dark transition-colors"
              >
                <WhatsAppSvg className="h-4 w-4" />
                <span>WhatsApp Directo</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Vital Sur"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink hover:border-brand-green hover:text-brand-green transition-colors"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.9} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Vital Sur"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink hover:border-brand-green hover:text-brand-green transition-colors"
              >
                <Facebook className="h-4 w-4" strokeWidth={1.9} />
              </a>
            </div>
          </div>
        </div>

        {/* Barra inferior de derechos y reglas de envío */}
        <div className="mt-10 border-t border-brand-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-ink-muted">
          <p>
            © {new Date().getFullYear()} {db.settings.storeName} — Florencio
            Varela, Buenos Aires, Argentina. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>
              Envíos a todo el país por {db.settings.shippingCarrier} · Envío
              GRATIS en compras superiores a{" "}
              {formatARS(db.settings.freeShippingThreshold)}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-brand-green" />
          </p>
        </div>
      </div>

      {/* Botón flotante de WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear por WhatsApp con Vital Sur"
        className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 rounded-pill bg-brand-green px-4 py-3 text-xs font-bold text-white shadow-soft-md hover:bg-brand-green-dark transition-all duration-200 hover:-translate-y-0.5"
      >
        <WhatsAppSvg className="h-5 w-5" />
        <span className="hidden sm:inline">Consultanos por WhatsApp</span>
      </a>
    </footer>
  );
}

