"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  FileText,
  Activity,
  Compass,
} from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductVectorArt } from "@/components/brand/ProductVectorArt";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { db, addToCart } = useVitalSur();

  const product = useMemo(
    () => db.products.find((p) => p.slug === params.slug),
    [db.products, params.slug]
  );

  const [selectedView, setSelectedView] = useState<
    "front" | "nutrition" | "detail"
  >("front");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<
    "descripcion" | "nutricion" | "uso"
  >("nutricion");

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-white">
        <StoreHeader />
        <main className="flex-1 mx-auto max-w-4xl px-4 pt-36 pb-20 text-center">
          <h1 className="font-display text-2xl font-extrabold text-brand-ink">
            Producto no encontrado
          </h1>
          <p className="mt-2 text-sm text-brand-ink-muted">
            El suplemento que buscás no está disponible o cambió de dirección.
          </p>
          <Link
            href="/productos"
            className="mt-6 inline-flex items-center gap-2 rounded-pill bg-brand-green px-6 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al catálogo</span>
          </Link>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const currentFlavor = selectedFlavor || product.flavors[0] || "Clásico";
  const currentSize = selectedSize || product.sizes[0] || "Estándar";
  const finalPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice !== null && product.salePrice < product.price;

  const relatedProducts = db.products
    .filter(
      (p) =>
        p.active &&
        p.id !== product.id &&
        (p.categoryId === product.categoryId || p.featured)
    )
    .slice(0, 4);

  const handleBuyNow = () => {
    addToCart(product, quantity, currentFlavor, currentSize, false);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <StoreHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Migas de pan" className="mb-4 flex items-center gap-2 text-xs font-semibold text-brand-ink-muted">
          <Link href="/" className="hover:text-brand-green">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-brand-green">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-brand-ink truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Bloque principal de producto */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Galería vectorial de 3 vistas */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative flex aspect-square w-full max-w-[480px] mx-auto items-center justify-center rounded-card-lg bg-brand-surface border border-brand-border p-6 shadow-soft">
              {product.badgeText && (
                <span className="absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-pill bg-brand-green px-3.5 py-1 text-xs font-bold text-white">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  {product.badgeText}
                </span>
              )}
              <div className="h-64 w-64 sm:h-72 sm:w-72 transition-transform duration-300">
                <ProductVectorArt
                  type={product.illustrationType}
                  accentColor={product.accentColor}
                  brand={product.brand}
                  view={selectedView}
                />
              </div>
            </div>

            {/* Miniaturas de vista */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "front", label: "Envase Frontal" },
                { id: "nutrition", label: "Ficha Nutricional" },
                { id: "detail", label: "Dosificador / Pureza" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() =>
                    setSelectedView(v.id as "front" | "nutrition" | "detail")
                  }
                  className={`flex flex-col items-center gap-2 rounded-card p-3 border text-xs font-bold transition-all ${
                    selectedView === v.id
                      ? "border-brand-green bg-brand-green-soft/50 text-brand-green-dark shadow-sm"
                      : "border-brand-border bg-white text-brand-ink-muted hover:border-brand-green/50"
                  }`}
                >
                  <div className="h-14 w-14">
                    <ProductVectorArt
                      type={product.illustrationType}
                      accentColor={product.accentColor}
                      brand={product.brand}
                      view={v.id as "front" | "nutrition" | "detail"}
                    />
                  </div>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Información de compra y variantes */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
                  {product.brand} · SKU {product.sku}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-bold ${
                    product.stock > 0
                      ? "bg-brand-green-soft text-brand-green-dark"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {product.stock > 0
                    ? `Stock disponible (${product.stock} u.)`
                    : "Sin stock"}
                </span>
              </div>

              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-brand-ink leading-tight">
                {product.name}
              </h1>

              <p className="mt-2.5 text-sm text-brand-ink-muted leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Precio en ARS */}
            <div className="rounded-card bg-brand-surface p-5 border border-brand-border">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-brand-ink">
                  {formatARS(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-base font-semibold text-brand-ink-subtle line-through">
                    {formatARS(product.price)}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs font-medium text-brand-green-dark">
                Abonando por transferencia bancaria tenés un{" "}
                <strong>{db.settings.transferDiscountPct}% de descuento</strong>{" "}
                adicional o pagá con Mercado Pago.
              </p>
            </div>

            {/* Selector de Sabor */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-ink">
                Elegí el sabor:{" "}
                <span className="text-brand-green-dark">{currentFlavor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`rounded-pill px-4 py-2 text-xs font-bold transition-all ${
                      currentFlavor === flavor
                        ? "bg-brand-green text-white shadow-sm"
                        : "bg-white border border-brand-border text-brand-ink hover:border-brand-green"
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Tamaño / Presentación */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-brand-ink">
                Presentación:{" "}
                <span className="text-brand-green-dark">{currentSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-pill px-4 py-2 text-xs font-bold transition-all ${
                      currentSize === size
                        ? "bg-brand-ink text-white"
                        : "bg-white border border-brand-border text-brand-ink hover:border-brand-green"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad y Botones de Compra */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="inline-flex items-center justify-between rounded-pill border border-brand-border bg-brand-surface px-4 py-2.5 sm:w-36">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Restar unidad"
                    className="p-1 text-brand-ink hover:text-brand-green"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <span className="font-display text-sm font-extrabold text-brand-ink">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    aria-label="Sumar unidad"
                    className="p-1 text-brand-ink hover:text-brand-green"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() =>
                    addToCart(
                      product,
                      quantity,
                      currentFlavor,
                      currentSize,
                      true
                    )
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-pill bg-brand-green px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-green-dark transition-colors shadow-soft disabled:bg-gray-200 disabled:text-gray-400"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                  <span>
                    Agregar al carrito · {formatARS(finalPrice * quantity)}
                  </span>
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleBuyNow}
                className="w-full rounded-pill border border-brand-ink bg-white py-3 px-6 text-sm font-bold text-brand-ink hover:bg-brand-ink hover:text-white transition-colors"
              >
                Comprar ahora e ir al checkout
              </button>
            </div>

            {/* Reglas de Envío Correo Argentino */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 rounded-card bg-brand-surface p-3.5 border border-brand-border">
                <Truck
                  className="h-5 w-5 shrink-0 text-brand-green mt-0.5"
                  strokeWidth={2}
                />
                <div className="text-xs">
                  <p className="font-bold text-brand-ink">
                    Envío Nacional {db.settings.shippingCarrier}
                  </p>
                  <p className="text-brand-ink-muted mt-0.5">
                    Costo fijo {formatARS(db.settings.shippingCost)} · Gratis
                    superando {formatARS(db.settings.freeShippingThreshold)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-card bg-brand-surface p-3.5 border border-brand-border">
                <ShieldCheck
                  className="h-5 w-5 shrink-0 text-brand-blue-dark mt-0.5"
                  strokeWidth={2}
                />
                <div className="text-xs">
                  <p className="font-bold text-brand-ink">
                    Garantía Oficial Vital Sur
                  </p>
                  <p className="text-brand-ink-muted mt-0.5">
                    Lote vigente, sello de pureza y despacho desde F. Varela.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de Información Nutricional, Descripción y Modo de Uso */}
        <div className="mt-14 rounded-card-lg bg-brand-surface border border-brand-border p-6 sm:p-8">
          <div className="flex flex-wrap gap-2 border-b border-brand-border pb-4">
            <button
              type="button"
              onClick={() => setActiveTab("nutricion")}
              className={`inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "nutricion"
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-white text-brand-ink border border-brand-border hover:border-brand-green"
              }`}
            >
              <Activity className="h-4 w-4" strokeWidth={2} />
              <span>Información Nutricional</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("descripcion")}
              className={`inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "descripcion"
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-white text-brand-ink border border-brand-border hover:border-brand-green"
              }`}
            >
              <FileText className="h-4 w-4" strokeWidth={2} />
              <span>Descripción Detallada</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("uso")}
              className={`inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                activeTab === "uso"
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-white text-brand-ink border border-brand-border hover:border-brand-green"
              }`}
            >
              <Compass className="h-4 w-4" strokeWidth={2} />
              <span>Modo de Uso Recomendado</span>
            </button>
          </div>

          <div className="mt-6">
            {activeTab === "nutricion" && (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <div className="rounded-card bg-white border border-brand-border overflow-hidden">
                    <div className="bg-brand-ink text-white p-4">
                      <h3 className="font-display text-base font-extrabold">
                        Información Nutricional
                      </h3>
                      <p className="text-xs text-gray-300 mt-0.5">
                        Tamaño de la porción:{" "}
                        <strong>{product.nutritionFacts.servingSize}</strong> ·
                        Porciones por envase:{" "}
                        <strong>
                          {product.nutritionFacts.servingsPerContainer}
                        </strong>
                      </p>
                    </div>
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-brand-border bg-brand-surface text-brand-ink-muted">
                          <th className="py-2.5 px-4 font-bold">
                            Nutriente / Componente
                          </th>
                          <th className="py-2.5 px-4 font-bold">
                            Cantidad por porción
                          </th>
                          <th className="py-2.5 px-4 font-bold text-right">
                            % VD (*)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border/60">
                        {product.nutritionFacts.rows.map((row) => (
                          <tr key={row.nutrient}>
                            <td className="py-2.5 px-4 font-semibold text-brand-ink">
                              {row.nutrient}
                            </td>
                            <td className="py-2.5 px-4 text-brand-ink-muted font-medium">
                              {row.amountPerServing}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-brand-green-dark">
                              {row.dailyValuePct}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-card bg-white p-5 border border-brand-border">
                    <h4 className="font-display text-sm font-extrabold text-brand-ink">
                      Ingredientes
                    </h4>
                    <p className="mt-1.5 text-xs text-brand-ink-muted leading-relaxed">
                      {product.nutritionFacts.ingredients}
                    </p>
                  </div>
                  <div className="rounded-card bg-white p-5 border border-brand-border">
                    <h4 className="font-display text-sm font-extrabold text-brand-ink">
                      Alérgenos y Certificaciones
                    </h4>
                    <p className="mt-1.5 text-xs text-brand-ink-muted leading-relaxed">
                      {product.nutritionFacts.allergens}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "descripcion" && (
              <div className="max-w-3xl space-y-4">
                <h3 className="font-display text-lg font-extrabold text-brand-ink">
                  Sobre {product.name}
                </h3>
                <p className="text-sm text-brand-ink-muted leading-relaxed">
                  {product.description}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-white border border-brand-border px-3.5 py-1.5 text-xs font-bold text-brand-ink">
                    <Check className="h-4 w-4 text-brand-green" />
                    Materias primas importadas de grado USP
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-white border border-brand-border px-3.5 py-1.5 text-xs font-bold text-brand-ink">
                    <Check className="h-4 w-4 text-brand-green" />
                    Sin azúcares agregados
                  </span>
                </div>
              </div>
            )}

            {activeTab === "uso" && (
              <div className="max-w-3xl rounded-card bg-white p-6 border border-brand-border space-y-3">
                <h3 className="font-display text-base font-extrabold text-brand-ink">
                  ¿Cómo tomar o utilizar este producto?
                </h3>
                <p className="text-sm text-brand-ink-muted leading-relaxed">
                  {product.usageInstructions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-extrabold text-brand-ink mb-6">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

