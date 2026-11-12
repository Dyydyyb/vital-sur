"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  HeartHandshake,
  Award,
  Star,
  Plus,
  Minus,
  CheckCircle2,
  MapPin,
  Quote,
  Package,
} from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { CategoryIcon, WhatsAppSvg } from "@/components/brand/CategoryIcon";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";

const HERO_SLIDES = [
  {
    id: "slide-1",
    image: "/images/hero/hero-slide-1.jpg",
    alt: "Línea completa de suplementos deportivos y bienestar Vital Sur en Florencio Varela",
  },
  {
    id: "slide-2",
    image: "/images/hero/hero-slide-2.jpg",
    alt: "Disciplina, salud y nutrición inteligente - Vital Sur Zona Sur",
  },
];

const TESTIMONIALS = [
  {
    id: "t1",
    name: "Lucas Gómez",
    location: "Florencio Varela, GBA Sur",
    role: "Entrenamiento de Fuerza",
    comment:
      "Compro la Whey y la Creatina en Vital Sur hace seis meses. La disolución es excelente, no cae pesada y la atención de los chicos en Varela siempre es de primera. El envío me llega impecable.",
    productBought: "Whey Protein Pure + Creatina 300g",
    rating: 5,
  },
  {
    id: "t2",
    name: "Camila Pereyra",
    location: "Quilmes Oeste, GBA Sur",
    role: "Media Maratón & Cross-Training",
    comment:
      "Me asesoraron por WhatsApp para elegir entre magnesio y colágeno para mis rodillas. El pedido me llegó rapidísimo y super prolijo embalado con las etiquetas de Correo Argentino.",
    productBought: "Magnesio Quelado + Colágeno Hidrolizado",
    rating: 5,
  },
  {
    id: "t3",
    name: "Martín Ledesma",
    location: "Córdoba Capital",
    role: "Ciclismo & Gimnasio",
    comment:
      "Hice una compra mayor a $80.000 para aprovechar el envío gratis por Correo Argentino y en 72 horas recibí las notificaciones en mi celular y la caja en mi domicilio.",
    productBought: "Combo Fuerza & Recuperación Total",
    rating: 5,
  },
  {
    id: "t4",
    name: "Valentina Ríos",
    location: "La Plata, Zona Sur",
    role: "Nutricionista Deportiva",
    comment:
      "Recomiendo las proteínas y creatinas de Vital Sur a mis pacientes por su transparencia en tablas nutricionales y porque son 100% libres de gluten (Sin TACC).",
    productBought: "Línea Completa BioSur Wellness",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "¿Cómo funcionan los envíos a todo el país por Correo Argentino?",
    a: "Despachamos de lunes a viernes desde Florencio Varela hacia todas las provincias de Argentina mediante Correo Argentino. El costo fijo es de $8.999 a cualquier punto del país, y si tu compra alcanza o supera los $80.000, el envío es 100% GRATIS.",
  },
  {
    q: "¿Puedo abonar con Mercado Pago o transferencia bancaria?",
    a: "Sí. En el checkout podés pagar con Mercado Pago (tarjetas de débito, crédito y dinero en cuenta con acreditación instantánea) o elegir transferencia bancaria directa a nuestro CBU/Alias.",
  },
  {
    q: "¿Cómo sé qué suplemento elegir según mi objetivo?",
    a: "Si buscás ganar masa muscular o acelerar tu recuperación, la base ideal es Whey Protein con Creatina Monohidratada (5 g diarios). Si buscás descanso reparador y evitar calambres, el Citrato + Bisglicinato de Magnesio es la mejor opción. También podés escribirnos por WhatsApp al 54 9 11 3406-2942 para asesorarte sin cargo.",
  },
  {
    q: "¿Los productos son originales y aptos para celíacos (Sin TACC)?",
    a: "Todos nuestros suplementos cuentan con número de lote, fecha de vencimiento y precinto termosellado de seguridad. Toda la línea Vital Sur Lab y BioSur Wellness es libre de gluten (Sin TACC).",
  },
  {
    q: "¿Tienen local a la calle en Florencio Varela?",
    a: "Somos una tienda 100% online nacida y gestionada desde Florencio Varela, Zona Sur. Por el momento no contamos con local comercial a la calle; todos nuestros pedidos se despachan a domicilio con seguro y la máxima rapidez a toda la Argentina.",
  },
];

export default function HomePage() {
  const { db, showToast } = useVitalSur();

  const [selectedFeaturedCat, setSelectedFeaturedCat] = useState<string>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Estado del Slider de Testimonios
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);

  // Estado del Slider de Hero
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // Autoplay para el Hero Slider
  useEffect(() => {
    if (isHeroPaused) return;
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHeroPaused]);

  const handleNextHeroSlide = () => {
    setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevHeroSlide = () => {
    setHeroSlideIndex(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
    );
  };

  // Referencias para scrolls horizontales fluidos
  const categoriesScrollRef = useRef<HTMLDivElement | null>(null);
  const productsScrollRef = useRef<HTMLDivElement | null>(null);

  const mainCategories = db.categories
    .filter((c) => c.parentId === null && c.active)
    .sort((a, b) => a.order - b.order);

  const activeProducts = db.products.filter((p) => p.active);

  const displayedProducts = activeProducts
    .filter((p) =>
      selectedFeaturedCat === "all"
        ? p.featured
        : p.categoryId === selectedFeaturedCat
    )
    .slice(0, 8);

  // Autoplay suave del slider de testimonios (pausable en hover)
  useEffect(() => {
    if (isTestimonialPaused) return;
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isTestimonialPaused]);

  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrevTestimonial = () => {
    setTestimonialIndex(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  // Scroll horizontal asistido para carruseles
  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (!ref.current) return;
    const offset = direction === "left" ? -280 : 280;
    ref.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes("@")) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
    showToast(
      "Suscripción confirmada",
      "¡Gracias por unirte a la comunidad de Vital Sur! Te enviaremos novedades y guías exclusivas."
    );
  };

  const currentTestimonial = TESTIMONIALS[testimonialIndex];

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <StoreHeader />

      <main className="flex-1">
        {/* =========================================================
            1. HERO A PANTALLA COMPLETA (100svh exactos, adaptado a laptops y móviles)
           ========================================================= */}
        {/* =========================================================
            1. HERO A PANTALLA COMPLETA (100svh exactos, slider de imágenes borde a borde)
           ========================================================= */}
        <section
          aria-label="Presentación principal de Vital Sur"
          className="relative h-[100svh] min-h-[100svh] max-h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-20 lg:pt-24 pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8 select-none"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
        >
          {/* Slider de imágenes de borde a borde */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  idx === heroSlideIndex
                    ? "opacity-100 z-0"
                    : "opacity-0 -z-10 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Flechas de navegación del Slider (borde a borde) */}
          <button
            type="button"
            onClick={handlePrevHeroSlide}
            aria-label="Imagen anterior"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/85 hover:bg-white text-brand-ink hover:text-brand-green border border-brand-border shadow-soft backdrop-blur-md transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={handleNextHeroSlide}
            aria-label="Siguiente imagen"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/85 hover:bg-white text-brand-ink hover:text-brand-green border border-brand-border shadow-soft backdrop-blur-md transition-all duration-200 hover:scale-105"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
          </button>

          {/* Contenido central del Hero: Por encima SIN recuadro, el hero se ve por completo */}
          <div className="relative z-10 mx-auto my-auto flex w-full max-w-3xl flex-col items-center justify-center text-center space-y-3 sm:space-y-4 animate-fade-slide px-4">
            <div className="inline-flex items-center gap-2 rounded-pill bg-white/90 backdrop-blur-sm border border-brand-border px-3.5 py-1 shadow-soft">
              <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold tracking-wide text-brand-ink">
                Florencio Varela, Zona Sur · Envíos a toda la Argentina
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-extrabold tracking-tight text-brand-ink leading-[1.15] drop-shadow-[0_1px_4px_rgba(255,255,255,0.95)]">
              {db.settings.heroTitle.split("energía real")[0]}
              <span className="text-brand-green">energía real</span>
              {db.settings.heroTitle.split("energía real")[1] ||
                " para potenciar cada entrenamiento"}
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm lg:text-base text-brand-ink-muted leading-relaxed font-medium drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]">
              {db.settings.heroSubtitle}
            </p>

            {/* Botones tipo píldora */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand-green px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-soft transition-all duration-200 ease-natural hover:bg-brand-green-dark hover:-translate-y-0.5"
              >
                <span>Ver productos</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <Link
                href="#quienes-somos"
                className="inline-flex items-center justify-center gap-2 rounded-pill border border-brand-border bg-white/95 px-7 py-3 text-xs sm:text-sm font-bold text-brand-ink shadow-soft transition-all duration-200 ease-natural hover:border-brand-green hover:text-brand-green hover:-translate-y-0.5"
              >
                <span>Conocer más</span>
              </Link>
            </div>

            {/* Indicadores horizontales rápidos */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg w-full border-t border-brand-ink/15">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl py-2 px-1 border border-white/60 shadow-soft-sm">
                <p className="font-display text-base sm:text-lg font-extrabold text-brand-ink">
                  100% Puros
                </p>
                <p className="text-[10px] sm:text-xs text-brand-ink-muted">
                  Aprobados y Sin TACC
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl py-2 px-1 border border-white/60 shadow-soft-sm">
                <p className="font-display text-base sm:text-lg font-extrabold text-brand-green-dark">
                  {formatARS(db.settings.freeShippingThreshold)}+
                </p>
                <p className="text-[10px] sm:text-xs text-brand-ink-muted">
                  Envío Gratis Nacional
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl py-2 px-1 border border-white/60 shadow-soft-sm">
                <p className="font-display text-base sm:text-lg font-extrabold text-brand-ink">
                  24 / 48 hs
                </p>
                <p className="text-[10px] sm:text-xs text-brand-ink-muted">
                  Despacho Correo Arg.
                </p>
              </div>
            </div>
          </div>

          {/* Controles inferiores del Slider e indicador animado de scroll */}
          <div className="relative z-10 mx-auto flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setHeroSlideIndex(idx)}
                  aria-label={`Ir al slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === heroSlideIndex
                      ? "w-8 bg-brand-green"
                      : "w-2.5 bg-brand-ink/25 hover:bg-brand-green/60"
                  }`}
                />
              ))}
            </div>

            <a
              href="#categorias"
              aria-label="Desplazarse a las categorías"
              className="group inline-flex flex-col items-center gap-1 text-[11px] font-semibold text-brand-ink-muted hover:text-brand-green transition-colors mt-0.5"
            >
              <span>Explorar líneas</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-brand-border shadow-soft animate-scroll-indicator group-hover:border-brand-green">
                <ChevronDown className="h-3.5 w-3.5 text-brand-green" strokeWidth={2.2} />
              </span>
            </a>
          </div>
        </section>

        {/* =========================================================
            2. CATEGORÍAS (Carrusel horizontal con scroll snap y botones de control)
           ========================================================= */}
        <section
          id="categorias"
          className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-brand-white scroll-mt-20 border-b border-brand-border/60"
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
                  Líneas Especializadas
                </span>
                <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-brand-ink">
                  Buscá según tu objetivo de entrenamiento
                </h2>
              </div>

              {/* Botones de navegación horizontal para carrusel */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollContainer(categoriesScrollRef, "left")}
                  aria-label="Desplazar categorías hacia la izquierda"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-ink hover:border-brand-green hover:text-brand-green transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollContainer(categoriesScrollRef, "right")}
                  aria-label="Desplazar categorías hacia la derecha"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-ink hover:border-brand-green hover:text-brand-green transition-colors"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Contenedor horizontal con snap y scroll táctil */}
            <div
              ref={categoriesScrollRef}
              className="flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-snap-x pb-2"
            >
              {mainCategories.map((cat) => {
                const count = activeProducts.filter(
                  (p) => p.categoryId === cat.id
                ).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/productos?categoria=${cat.slug}`}
                    className="group flex flex-col items-center text-center rounded-card bg-brand-surface border border-brand-border/80 p-4 min-w-[145px] sm:min-w-[160px] max-w-[160px] shrink-0 scroll-snap-align-start transition-all duration-200 ease-natural hover:-translate-y-1 hover:bg-white hover:border-brand-green hover:shadow-soft"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-green border border-brand-border shadow-sm transition-colors duration-200 group-hover:bg-brand-green group-hover:text-white">
                      <CategoryIcon name={cat.iconName} className="h-5 w-5" />
                    </div>
                    <h3 className="mt-2.5 font-display text-xs font-bold text-brand-ink group-hover:text-brand-green-dark truncate w-full">
                      {cat.name}
                    </h3>
                    <span className="mt-0.5 text-[10px] font-medium text-brand-ink-muted">
                      {count} {count === 1 ? "producto" : "productos"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            3. PRODUCTOS DESTACADOS (Grilla balanceada horizontalmente con carrusel)
           ========================================================= */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-brand-surface border-b border-brand-border/70">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
                  Selección Vital Sur
                </span>
                <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-brand-ink">
                  Suplementos más elegidos
                </h2>
              </div>

              {/* Filtro rápido por pestañas tipo píldora + controles de slider */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedFeaturedCat("all")}
                    className={`rounded-pill px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                      selectedFeaturedCat === "all"
                        ? "bg-brand-green text-white shadow-sm"
                        : "bg-white text-brand-ink border border-brand-border hover:border-brand-green"
                    }`}
                  >
                    Destacados
                  </button>
                  {mainCategories.slice(0, 4).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedFeaturedCat(cat.id)}
                      className={`rounded-pill px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                        selectedFeaturedCat === cat.id
                          ? "bg-brand-green text-white shadow-sm"
                          : "bg-white text-brand-ink border border-brand-border hover:border-brand-green"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex items-center gap-1.5 pl-2">
                  <button
                    type="button"
                    onClick={() => scrollContainer(productsScrollRef, "left")}
                    aria-label="Desplazar productos hacia la izquierda"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink hover:border-brand-green hover:text-brand-green transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollContainer(productsScrollRef, "right")}
                    aria-label="Desplazar productos hacia la derecha"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink hover:border-brand-green hover:text-brand-green transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </div>

            {/* Carrusel horizontal en móviles y grilla adaptativa en desktop */}
            {displayedProducts.length > 0 ? (
              <div
                ref={productsScrollRef}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible no-scrollbar scroll-snap-x pb-2"
              >
                {displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-[270px] sm:min-w-[290px] md:min-w-0 shrink-0 scroll-snap-align-start"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full rounded-card-lg bg-white border border-brand-border p-10 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface text-brand-green">
                  <Package className="h-7 w-7" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-base font-bold text-brand-ink">
                  Catálogo en preparación
                </h3>
                <p className="mx-auto max-w-md text-xs text-brand-ink-muted">
                  Podés dar de alta suplementos fácilmente desde el panel de administración o conectando tu base de datos Supabase.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-pill bg-brand-green px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-green-dark transition-colors"
                  >
                    <span>Gestionar en Panel Admin</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-brand-border/60 pt-4">
              <span className="text-xs text-brand-ink-muted">
                {activeProducts.length} fórmulas activas disponibles en tienda
              </span>
              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green-dark hover:text-brand-green"
              >
                <span>Explorar todo el catálogo</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. BENEFICIOS EN FILA HORIZONTAL COMPACTA
           ========================================================= */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-brand-white border-b border-brand-border/60">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-card bg-brand-surface p-4 border border-brand-border/80 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue-dark">
                  <Truck className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-bold text-brand-ink">
                    Envíos Nacionales
                  </h3>
                  <p className="mt-0.5 text-[11px] text-brand-ink-muted leading-tight">
                    Por <strong>Correo Argentino</strong>. Gratis superando los{" "}
                    <strong>{formatARS(db.settings.freeShippingThreshold)}</strong>.
                  </p>
                </div>
              </div>

              <div className="rounded-card bg-brand-surface p-4 border border-brand-border/80 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green-soft text-brand-green-dark">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-bold text-brand-ink">
                    Pago 100% Seguro
                  </h3>
                  <p className="mt-0.5 text-[11px] text-brand-ink-muted leading-tight">
                    Mercado Pago o transferencia bancaria directa a CBU/Alias.
                  </p>
                </div>
              </div>

              <div className="rounded-card bg-brand-surface p-4 border border-brand-border/80 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green-soft text-brand-green-dark">
                  <HeartHandshake className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-bold text-brand-ink">
                    Asesoramiento Real
                  </h3>
                  <p className="mt-0.5 text-[11px] text-brand-ink-muted leading-tight">
                    Atención personalizada por WhatsApp desde Florencio Varela.
                  </p>
                </div>
              </div>

              <div className="rounded-card bg-brand-surface p-4 border border-brand-border/80 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue-dark">
                  <Award className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display text-xs sm:text-sm font-bold text-brand-ink">
                    Pureza Garantizada
                  </h3>
                  <p className="mt-0.5 text-[11px] text-brand-ink-muted leading-tight">
                    Sin aditivos engañosos, precintados y certificados Sin TACC.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. SLIDER DE TESTIMONIOS (Interactivo, con animación y dots)
           ========================================================= */}
        <section
          aria-label="Testimonios de deportistas"
          className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-brand-surface border-b border-brand-border/70"
          onMouseEnter={() => setIsTestimonialPaused(true)}
          onMouseLeave={() => setIsTestimonialPaused(false)}
        >
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
                  Comunidad Vital Sur
                </span>
                <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-brand-ink">
                  Experiencias reales de atletas y vecinos
                </h2>
              </div>

              {/* Controles del Slider */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevTestimonial}
                  aria-label="Testimonio anterior"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink hover:border-brand-green hover:text-brand-green transition-all shadow-sm active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={handleNextTestimonial}
                  aria-label="Testimonio siguiente"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink hover:border-brand-green hover:text-brand-green transition-all shadow-sm active:scale-95"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Tarjeta Panorámica del Slider con Animación Suave */}
            <div
              key={currentTestimonial.id}
              className="relative rounded-card-lg bg-white p-6 sm:p-8 border border-brand-border shadow-soft animate-fade-slide overflow-hidden"
            >
              <Quote
                className="absolute right-6 top-6 h-16 w-16 text-brand-surfaceAlt pointer-events-none"
                strokeWidth={1.2}
              />

              <div className="flex items-center gap-1.5 text-brand-green mb-3">
                {[...Array(currentTestimonial.rating)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-brand-green text-brand-green"
                    strokeWidth={1.8}
                  />
                ))}
                <span className="text-xs font-extrabold text-brand-ink ml-1.5">
                  5.0 / 5.0
                </span>
              </div>

              <blockquote className="text-sm sm:text-base text-brand-ink leading-relaxed font-medium">
                &ldquo;{currentTestimonial.comment}&rdquo;
              </blockquote>

              <div className="mt-6 pt-4 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-extrabold text-brand-ink">
                    {currentTestimonial.name}
                  </p>
                  <p className="text-xs text-brand-ink-muted">
                    {currentTestimonial.location} · {currentTestimonial.role}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-pill bg-brand-surface px-3 py-1 text-[11px] font-semibold text-brand-ink border border-brand-border">
                    {currentTestimonial.productBought}
                  </span>
                  <span className="rounded-pill bg-brand-green-soft px-2.5 py-1 text-[10px] font-bold text-brand-green-dark border border-brand-green/20">
                    Compra Verificada
                  </span>
                </div>
              </div>

              {/* Indicadores de Puntos (Dots) Interactivos */}
              <div className="flex items-center justify-center gap-2 mt-5 pt-2">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTestimonialIndex(idx)}
                    aria-label={`Ver testimonio ${idx + 1}`}
                    className={`h-2 rounded-pill transition-all duration-300 ${
                      testimonialIndex === idx
                        ? "w-8 bg-brand-green"
                        : "w-2 bg-brand-border hover:bg-brand-green/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. QUIÉNES SOMOS (Emprendimiento familiar de Florencio Varela)
           ========================================================= */}
        <section
          id="quienes-somos"
          className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-brand-white border-b border-brand-border/60 scroll-mt-20"
        >
          <div className="mx-auto max-w-4xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-pill bg-brand-surface border border-brand-border px-4 py-1.5 text-xs font-bold text-brand-green-dark shadow-soft">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Emprendimiento Familiar de Florencio Varela</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-ink leading-tight">
              Nacimos en Zona Sur con una premisa: suplementación honesta y sin sobreprecios
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-brand-ink-muted leading-relaxed max-w-2xl mx-auto">
              <strong className="text-brand-ink">Vital Sur</strong> surgió en Florencio Varela impulsado
              por una familia apasionada por el entrenamiento atlético y la fuerza.
              Trabajamos directamente con laboratorios auditados para ofrecerte materias primas
              con trazabilidad transparente, máxima pureza y despacho seguro a toda la Argentina por Correo Argentino.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
              <div className="rounded-card-lg bg-brand-surface p-5 border border-brand-border shadow-soft">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-brand-green-dark">
                  +4.800
                </p>
                <p className="text-xs font-semibold text-brand-ink-muted mt-1">
                  Pedidos entregados
                </p>
              </div>
              <div className="rounded-card-lg bg-brand-surface p-5 border border-brand-border shadow-soft">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
                  100%
                </p>
                <p className="text-xs font-semibold text-brand-ink-muted mt-1">
                  Trazabilidad y Sin TACC
                </p>
              </div>
              <div className="rounded-card-lg bg-brand-surface p-5 border border-brand-border shadow-soft">
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-brand-blue-dark">
                  F. Varela
                </p>
                <p className="text-xs font-semibold text-brand-ink-muted mt-1">
                  Zona Sur, Buenos Aires
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            7. PREGUNTAS FRECUENTES + NEWSLETTER & WHATSAPP
            (Unificados en 2 columnas horizontales para eliminar scroll excesivo)
           ========================================================= */}
        <section
          id="preguntas"
          className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-brand-surface scroll-mt-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Columna Izquierda: Acordeón de FAQ */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
                    Dudas Frecuentes
                  </span>
                  <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-brand-ink">
                    Todo sobre envíos, pagos y suplementos
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {FAQS.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={faq.q}
                        className="rounded-card bg-white border border-brand-border overflow-hidden transition-all duration-200"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-3 p-4 text-left font-display text-xs sm:text-sm font-bold text-brand-ink hover:text-brand-green transition-colors"
                        >
                          <span>{faq.q}</span>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-surface text-brand-green">
                            {isOpen ? (
                              <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                            ) : (
                              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                            )}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs text-brand-ink-muted leading-relaxed border-t border-brand-border/50 pt-2.5 animate-fade-slide">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Columna Derecha: Newsletter y Contacto Directo WhatsApp */}
              <div className="lg:col-span-5 space-y-4">
                {/* Tarjeta Newsletter */}
                <div className="rounded-card-lg bg-white border border-brand-border p-5 sm:p-6 shadow-soft space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green-soft px-3 py-0.5 text-[11px] font-bold text-brand-green-dark">
                    Comunidad Vital Sur
                  </span>
                  <h3 className="font-display text-lg font-extrabold text-brand-ink">
                    Novedades y Guías de Suplementación
                  </h3>
                  <p className="text-xs text-brand-ink-muted">
                    Suscribite gratis y recibí asesoramiento sobre nutrición deportiva, ingresos de productos y lanzamientos de Vital Sur.
                  </p>

                  {newsletterSubscribed ? (
                    <div className="flex items-center gap-2.5 rounded-card bg-brand-green-soft p-3 text-brand-green-dark border border-brand-green/30">
                      <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={2} />
                      <p className="text-xs font-bold">
                        ¡Gracias por suscribirte a la comunidad de Vital Sur!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full rounded-pill border border-brand-border bg-brand-surface px-4 py-2.5 text-xs text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-pill bg-brand-green py-2.5 px-4 text-xs font-bold text-white hover:bg-brand-green-dark transition-colors"
                      >
                        Suscribirme a las novedades
                      </button>
                    </form>
                  )}
                </div>

                {/* Tarjeta Asesoramiento WhatsApp Varela */}
                <div className="rounded-card-lg bg-white border border-brand-border p-5 sm:p-6 shadow-soft flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-brand-ink">
                      ¿Tenés dudas sobre qué tomar?
                    </p>
                    <p className="text-[11px] text-brand-ink-muted leading-tight">
                      Escribinos directo a nuestro WhatsApp de Florencio Varela.
                    </p>
                    <p className="text-xs font-mono font-bold text-brand-green-dark">
                      +54 9 11 3406-2942
                    </p>
                  </div>
                  <a
                    href="https://wa.me/5491134062942"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-white hover:bg-brand-green-dark transition-transform hover:scale-105 shadow-sm"
                    aria-label="Chatear por WhatsApp al 54 9 11 3406-2942"
                  >
                    <WhatsAppSvg className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
