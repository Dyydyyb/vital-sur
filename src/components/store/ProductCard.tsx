"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Sparkles, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { formatARS } from "@/lib/format";
import { ProductVectorArt } from "@/components/brand/ProductVectorArt";
import { useVitalSur } from "@/context/VitalSurContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useVitalSur();
  const [justAdded, setJustAdded] = useState(false);

  const finalPrice = product.salePrice ?? product.price;
  const hasDiscount =
    product.salePrice !== null && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addToCart(product, 1, product.flavors[0], product.sizes[0], false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 950);
  };

  return (
    <article className="group relative flex flex-col rounded-card-lg bg-white border border-brand-border/80 p-4 shadow-soft transition-all duration-300 ease-natural hover:-translate-y-1 hover:shadow-soft-md hover:border-brand-green/40">
      {/* Insignias superiores */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between gap-2 pointer-events-none">
        {hasDiscount ? (
          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-green px-3 py-1 text-[11px] font-bold text-white shadow-sm">
            -{discountPercent}% OFF
          </span>
        ) : product.badgeText ? (
          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-green-soft px-3 py-1 text-[11px] font-bold text-brand-green-dark border border-brand-green/20">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            {product.badgeText}
          </span>
        ) : (
          <span />
        )}

        {product.stock <= product.minStock && product.stock > 0 && (
          <span className="rounded-pill bg-brand-blue-light px-2.5 py-1 text-[11px] font-semibold text-brand-blue-dark">
            Últimas {product.stock} u.
          </span>
        )}
      </div>

      {/* Ilustración vectorial del envase */}
      <Link
        href={`/productos/${product.slug}`}
        className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-card bg-brand-surface p-5 transition-colors duration-300 group-hover:bg-brand-surfaceAlt/70"
      >
        <div className="h-44 w-44 transition-transform duration-300 ease-natural group-hover:scale-105">
          <ProductVectorArt
            type={product.illustrationType}
            accentColor={product.accentColor}
            brand={product.brand}
          />
        </div>
        <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-sm opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          <Eye className="h-4 w-4" strokeWidth={1.9} />
        </span>
      </Link>

      {/* Información del producto */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-brand-ink-muted">
            <span className="uppercase tracking-wider text-brand-green-dark">
              {product.brand}
            </span>
            <span>{product.sizes[0]}</span>
          </div>

          <Link href={`/productos/${product.slug}`} className="mt-1.5 block">
            <h3 className="font-display text-base font-bold text-brand-ink line-clamp-2 group-hover:text-brand-green transition-colors duration-200">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1.5 text-xs text-brand-ink-muted line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-brand-border/60">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {hasDiscount && (
                <span className="block text-xs font-medium text-brand-ink-subtle line-through">
                  {formatARS(product.price)}
                </span>
              )}
              <span className="font-display text-xl font-extrabold text-brand-ink">
                {formatARS(finalPrice)}
              </span>
            </div>
            <span className="text-[11px] font-medium text-brand-green-dark bg-brand-green-soft/70 px-2.5 py-0.5 rounded-pill">
              Sin TACC
            </span>
          </div>

          {/* Botón píldora con microinteracción */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`mt-3.5 flex w-full items-center justify-center gap-2 rounded-pill py-2.5 px-4 text-sm font-bold transition-all duration-200 ease-natural active:scale-[0.98] ${
              product.stock <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : justAdded
                ? "bg-brand-green-dark text-white"
                : "bg-brand-green text-white hover:bg-brand-green-dark shadow-sm"
            }`}
          >
            {product.stock <= 0 ? (
              <span>Sin stock disponible</span>
            ) : justAdded ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2.4} />
                <span>Agregado al carrito</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                <span>Agregar al carrito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

