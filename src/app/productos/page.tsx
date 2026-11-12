"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  PackageSearch,
  ChevronDown,
} from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";

function CatalogContent() {
  const { db } = useVitalSur();
  const searchParams = useSearchParams();

  const initialCategorySlug = searchParams.get("categoria") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState(initialCategorySlug);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "name-asc"
  >("featured");
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const catParam = searchParams.get("categoria");
    const qParam = searchParams.get("q");
    if (catParam) setSelectedCategorySlug(catParam);
    if (qParam !== null) setSearchQuery(qParam);
  }, [searchParams]);

  const activeCategories = useMemo(
    () =>
      db.categories
        .filter((c) => c.active && c.parentId === null)
        .sort((a, b) => a.order - b.order),
    [db.categories]
  );

  const brands = useMemo(() => {
    const set = new Set(
      db.products.filter((p) => p.active).map((p) => p.brand)
    );
    return Array.from(set);
  }, [db.products]);

  const filteredProducts = useMemo(() => {
    return db.products
      .filter((p) => p.active)
      .filter((product) => {
        if (selectedCategorySlug !== "all") {
          const matchedCat = db.categories.find(
            (c) => c.slug === selectedCategorySlug
          );
          if (matchedCat) {
            const isInCategory =
              product.categoryId === matchedCat.id ||
              product.subcategoryId === matchedCat.id;
            if (!isInCategory) return false;
          }
        }
        if (selectedBrand !== "all" && product.brand !== selectedBrand) {
          return false;
        }
        const effectivePrice = product.salePrice ?? product.price;
        if (effectivePrice > maxPrice) {
          return false;
        }
        if (onlyOffers && !product.salePrice) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesBrand = product.brand.toLowerCase().includes(q);
          const matchesDesc = product.shortDescription
            .toLowerCase()
            .includes(q);
          const matchesSku = product.sku.toLowerCase().includes(q);
          if (!matchesName && !matchesBrand && !matchesDesc && !matchesSku) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return (b.soldCount || 0) - (a.soldCount || 0);
      });
  }, [
    db.products,
    db.categories,
    selectedCategorySlug,
    selectedBrand,
    maxPrice,
    onlyOffers,
    searchQuery,
    sortBy,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategorySlug("all");
    setSelectedBrand("all");
    setMaxPrice(100000);
    setOnlyOffers(false);
    setSortBy("featured");
    setVisibleCount(8);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-14 sm:px-6 lg:px-8">
      {/* Encabezado del Catálogo compacto */}
      <div className="rounded-card-lg bg-brand-surface border border-brand-border p-5 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
              Tienda Oficial Vital Sur
            </span>
            <h1 className="mt-0.5 font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-brand-ink">
              Catálogo de Suplementos y Bienestar
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-brand-ink-muted">
              Despachos diarios a todo el país por{" "}
              <strong>{db.settings.shippingCarrier}</strong> · Envío gratis en
              compras superiores a {formatARS(db.settings.freeShippingThreshold)}.
            </p>
          </div>

          {/* Buscador en tiempo real */}
          <div className="relative w-full md:w-80">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, marca o SKU..."
              className="w-full rounded-pill border border-brand-border bg-white py-2 pl-9 pr-4 text-xs sm:text-sm text-brand-ink placeholder:text-brand-ink-subtle focus:border-brand-green focus:outline-none shadow-sm"
            />
            <Search
              className="absolute left-3 top-2.5 h-4 w-4 text-brand-ink-subtle"
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Carrusel de chips horizontales para acceso rápido en móviles y notebooks */}
        <div className="mt-4 pt-3 border-t border-brand-border/70 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-snap-x">
          <button
            type="button"
            onClick={() => setSelectedCategorySlug("all")}
            className={`rounded-pill px-3.5 py-1.5 text-xs font-bold shrink-0 scroll-snap-align-start transition-all ${
              selectedCategorySlug === "all"
                ? "bg-brand-green text-white shadow-sm"
                : "bg-white border border-brand-border text-brand-ink hover:border-brand-green"
            }`}
          >
            Todas ({db.products.filter((p) => p.active).length})
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategorySlug(cat.slug)}
              className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-xs font-bold shrink-0 scroll-snap-align-start transition-all ${
                selectedCategorySlug === cat.slug
                  ? "bg-brand-green text-white shadow-sm"
                  : "bg-white border border-brand-border text-brand-ink hover:border-brand-green"
              }`}
            >
              <CategoryIcon name={cat.iconName} className="h-3.5 w-3.5" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Panel lateral de filtros */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="rounded-card-lg bg-white border border-brand-border p-5 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold text-brand-ink">
                <SlidersHorizontal
                  className="h-4 w-4 text-brand-green"
                  strokeWidth={2}
                />
                <span>Filtros</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-ink-muted hover:text-brand-green"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Limpiar</span>
              </button>
            </div>

            {/* Filtro por Categoría */}
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-ink mb-2.5">
                Categorías
              </h2>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategorySlug("all")}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-xs font-bold transition-colors ${
                    selectedCategorySlug === "all"
                      ? "bg-brand-green text-white"
                      : "text-brand-ink hover:bg-brand-surface"
                  }`}
                >
                  <span>Todas las categorías</span>
                  <span>
                    {db.products.filter((p) => p.active).length}
                  </span>
                </button>
                {activeCategories.map((cat) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  const subcats = db.categories.filter(
                    (sub) => sub.parentId === cat.id && sub.active
                  );
                  return (
                    <div key={cat.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-brand-green text-white"
                            : "text-brand-ink hover:bg-brand-surface"
                        }`}
                      >
                        <CategoryIcon
                          name={cat.iconName}
                          className="h-4 w-4 shrink-0"
                        />
                        <span className="truncate text-left flex-1">
                          {cat.name}
                        </span>
                      </button>

                      {/* Subcategorías anidadas */}
                      {subcats.length > 0 && (
                        <div className="pl-6 space-y-1">
                          {subcats.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => setSelectedCategorySlug(sub.slug)}
                              className={`block w-full text-left rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                selectedCategorySlug === sub.slug
                                  ? "bg-brand-green-soft text-brand-green-dark font-bold"
                                  : "text-brand-ink-muted hover:text-brand-green"
                              }`}
                            >
                              · {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filtro por Marca / Línea */}
            <div className="border-t border-brand-border pt-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-ink mb-2.5">
                Línea / Marca
              </h2>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedBrand("all")}
                  className={`block w-full text-left rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    selectedBrand === "all"
                      ? "bg-brand-green-soft text-brand-green-dark font-bold"
                      : "text-brand-ink-muted hover:bg-brand-surface"
                  }`}
                >
                  Todas las líneas
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`block w-full text-left rounded-xl px-3 py-1.5 text-xs font-semibold ${
                      selectedBrand === brand
                        ? "bg-brand-green-soft text-brand-green-dark font-bold"
                        : "text-brand-ink-muted hover:bg-brand-surface"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por Precio Máximo */}
            <div className="border-t border-brand-border pt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold uppercase tracking-wider text-brand-ink">
                  Precio hasta
                </span>
                <span className="font-bold text-brand-green-dark">
                  {formatARS(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={100000}
                step={2500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-green cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-brand-ink-subtle mt-1">
                <span>$10.000</span>
                <span>$100.000</span>
              </div>
            </div>

            {/* Solo Ofertas */}
            <div className="border-t border-brand-border pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOffers}
                  onChange={(e) => setOnlyOffers(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-green focus:ring-brand-green"
                />
                <span className="text-xs font-bold text-brand-ink">
                  Solo productos en oferta
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Grilla de Productos y Ordenamiento */}
        <section className="lg:col-span-9">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 rounded-card bg-brand-surface px-4 py-3 border border-brand-border/80">
            <p className="text-xs font-semibold text-brand-ink-muted">
              Mostrando{" "}
              <strong className="text-brand-ink">
                {visibleProducts.length}
              </strong>{" "}
              de{" "}
              <strong className="text-brand-ink">
                {filteredProducts.length}
              </strong>{" "}
              productos encontrados
            </p>

            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-xs font-bold text-brand-ink-muted"
              >
                Ordenar por:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "featured"
                      | "price-asc"
                      | "price-desc"
                      | "name-asc"
                  )
                }
                className="rounded-pill border border-brand-border bg-white px-3.5 py-1.5 text-xs font-bold text-brand-ink focus:border-brand-green focus:outline-none"
              >
                <option value="featured">Más relevantes / Más vendidos</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="name-asc">Alfabético (A - Z)</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-card-lg bg-brand-surface border border-brand-border p-12 text-center">
              <PackageSearch
                className="mx-auto h-12 w-12 text-brand-ink-subtle"
                strokeWidth={1.6}
              />
              <h3 className="mt-4 font-display text-lg font-bold text-brand-ink">
                {db.products.length === 0
                  ? "Catálogo en actualización"
                  : "No encontramos productos con esos filtros"}
              </h3>
              <p className="mt-1 text-xs text-brand-ink-muted">
                {db.products.length === 0
                  ? "Estamos renovando nuestro stock disponible. Consultanos por WhatsApp para asesoramiento personalizado."
                  : "Probá ampliando el rango de precio o limpiando la búsqueda."}
              </p>
              {db.products.length === 0 ? (
                <a
                  href="https://wa.me/5491134062942?text=Hola%20Vital%20Sur%2C%20quiero%20consultar%20por%20suplementos%20disponibles."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-pill bg-brand-green px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-green-dark"
                >
                  Consultar por WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-pill bg-brand-green px-6 py-2.5 text-xs font-bold text-white hover:bg-brand-green-dark"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Carga progresiva */}
              {visibleCount < filteredProducts.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="inline-flex items-center gap-2 rounded-pill border border-brand-border bg-white px-7 py-3 text-sm font-bold text-brand-ink shadow-soft hover:border-brand-green hover:text-brand-green transition-colors"
                  >
                    <span>
                      Cargar más productos (
                      {filteredProducts.length - visibleCount} restantes)
                    </span>
                    <ChevronDown className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <StoreHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 pt-32 pb-20 text-center text-sm text-brand-ink-muted">
              Cargando catálogo de Vital Sur...
            </div>
          }
        >
          <CatalogContent />
        </Suspense>
      </main>
      <StoreFooter />
    </div>
  );
}

