"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ProductVectorArt } from "@/components/brand/ProductVectorArt";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";

export default function FullCartPage() {
  const {
    db,
    cart,
    cartCount,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    shippingInfo,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyCouponCode,
    removeCoupon,
    addToCart,
  } = useVitalSur();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await applyCouponCode(couponInput);
    setCouponMessage(res);
    if (res.ok) setCouponInput("");
  };

  // Productos recomendados para alcanzar el envío gratis
  const suggestedAddons = db.products
    .filter(
      (p) =>
        p.active &&
        !cart.some((c) => c.productId === p.id)
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-brand-white">
      <StoreHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-green">
              Resumen de Compra
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-brand-ink">
              Tu Carrito de Suplementos ({cartCount})
            </h1>
          </div>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-ink-muted hover:text-brand-green"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            <span>Seguir comprando</span>
          </Link>
        </div>

        {/* Barra de Progreso Animada hacia el Envío Gratis */}
        <div className="mb-8 rounded-card-lg bg-brand-surface border border-brand-border p-5 sm:p-6 shadow-soft">
          {shippingInfo.isFreeShipping ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-brand-green-dark">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-white">
                  <CheckCircle2 className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-brand-ink">
                    ¡Tenés ENVÍO GRATIS a todo el país por{" "}
                    {db.settings.shippingCarrier}!
                  </h2>
                  <p className="text-xs text-brand-ink-muted">
                    Tu subtotal ({formatARS(cartSubtotal)}) alcanzó el umbral de{" "}
                    {formatARS(db.settings.freeShippingThreshold)}. Ahorrás{" "}
                    {formatARS(db.settings.shippingCost)} en el despacho.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green-soft px-4 py-1.5 text-xs font-extrabold text-brand-green-dark border border-brand-green/30 self-start sm:self-center">
                <Truck className="h-4 w-4" strokeWidth={2} />
                Bonificación Aplicada ($0)
              </span>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-brand-border text-brand-green">
                    <Truck className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-brand-ink">
                      Te faltan{" "}
                      <span className="text-brand-green-dark font-extrabold">
                        {formatARS(shippingInfo.remainingForFreeShipping)}
                      </span>{" "}
                      para tener envío gratis
                    </p>
                    <p className="text-xs text-brand-ink-muted">
                      Costo de envío fijo nacional por{" "}
                      {db.settings.shippingCarrier}:{" "}
                      <strong>{formatARS(db.settings.shippingCost)}</strong> ·
                      Gratis superando{" "}
                      <strong>
                        {formatARS(db.settings.freeShippingThreshold)}
                      </strong>
                    </p>
                  </div>
                </div>
                <span className="font-display text-sm font-extrabold text-brand-green-dark">
                  {shippingInfo.progressPercentage}% completado
                </span>
              </div>

              <div className="mt-3.5 h-3 w-full overflow-hidden rounded-pill bg-white border border-brand-border">
                <div
                  className="h-full rounded-pill bg-brand-green transition-all duration-500 ease-natural"
                  style={{ width: `${shippingInfo.progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="rounded-card-lg bg-brand-surface border border-brand-border p-12 text-center space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-brand-ink-subtle border border-brand-border">
              <ShoppingBag className="h-9 w-9" strokeWidth={1.7} />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="font-display text-xl font-extrabold text-brand-ink">
                Todavía no agregaste productos a tu carrito
              </h2>
              <p className="mt-1.5 text-sm text-brand-ink-muted">
                Explorá nuestras proteínas, creatinas y vitaminas o agregá
                alguno de los recomendados abajo para probar el cálculo de
                envío.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-pill bg-brand-green px-7 py-3 text-sm font-bold text-white hover:bg-brand-green-dark transition-colors"
              >
                <span>Ir al catálogo de productos</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>

            {/* Sugeridos rápidos si está vacío */}
            <div className="pt-8 border-t border-brand-border max-w-3xl mx-auto">
              <p className="text-xs font-extrabold uppercase tracking-wider text-brand-ink-muted mb-4">
                Agregá en 1 clic para probar el carrito:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestedAddons.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() =>
                      addToCart(
                        prod,
                        1,
                        prod.flavors[0],
                        prod.sizes[0],
                        false
                      )
                    }
                    className="flex items-center justify-between gap-2 rounded-card bg-white p-3.5 border border-brand-border text-left hover:border-brand-green transition-colors"
                  >
                    <div className="truncate">
                      <p className="text-xs font-bold text-brand-ink truncate">
                        {prod.name}
                      </p>
                      <p className="text-xs font-extrabold text-brand-green-dark">
                        {formatARS(prod.salePrice ?? prod.price)}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green-soft text-brand-green-dark">
                      <Plus className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Listado de ítems */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-card-lg bg-white border border-brand-border overflow-hidden shadow-soft">
                <div className="divide-y divide-brand-border/70">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.flavor}-${item.size}`}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-surface/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-24 w-24 shrink-0 rounded-card bg-brand-surface p-2.5 border border-brand-border">
                          <ProductVectorArt
                            type={item.illustrationType}
                            accentColor={item.accentColor}
                            brand={item.brand}
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-green-dark">
                            {item.brand} · SKU {item.sku}
                          </span>
                          <Link
                            href={`/productos/${item.slug}`}
                            className="block font-display text-base font-bold text-brand-ink hover:text-brand-green"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-brand-ink-muted mt-0.5">
                            Sabor: <strong>{item.flavor}</strong> · Tamaño:{" "}
                            <strong>{item.size}</strong>
                          </p>
                          <p className="text-xs font-bold text-brand-ink mt-1">
                            Precio unitario: {formatARS(item.unitPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-brand-border/50">
                        <div className="inline-flex items-center rounded-pill bg-brand-surface border border-brand-border px-2 py-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.flavor,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            aria-label="Disminuir cantidad"
                            className="p-1.5 text-brand-ink hover:text-brand-green"
                          >
                            <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </button>
                          <span className="px-3 text-sm font-extrabold text-brand-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.flavor,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            aria-label="Aumentar cantidad"
                            className="p-1.5 text-brand-ink hover:text-brand-green"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </button>
                        </div>

                        <div className="text-right min-w-[95px]">
                          <span className="font-display text-base font-extrabold text-brand-ink">
                            {formatARS(item.unitPrice * item.quantity)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.productId,
                              item.flavor,
                              item.size
                            )
                          }
                          aria-label="Quitar producto"
                          className="rounded-full p-2 text-brand-ink-subtle hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-brand-surface px-5 py-3.5 border-t border-brand-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs font-bold text-brand-ink-muted hover:text-red-600 transition-colors"
                  >
                    Vaciar carrito completo
                  </button>
                  <span className="text-xs text-brand-ink-muted">
                    Tu carrito se guarda automáticamente en este navegador
                  </span>
                </div>
              </div>

              {/* Sugeridos para completar el envío gratis */}
              {!shippingInfo.isFreeShipping && suggestedAddons.length > 0 && (
                <div className="rounded-card bg-brand-surface p-5 border border-brand-border">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-ink mb-3">
                    Sumá alguno de estos productos para acercarte al Envío Gratis:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {suggestedAddons.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between gap-2 rounded-2xl bg-white p-3 border border-brand-border"
                      >
                        <div className="truncate">
                          <p className="text-xs font-bold text-brand-ink truncate">
                            {prod.name}
                          </p>
                          <p className="text-xs font-extrabold text-brand-green-dark">
                            {formatARS(prod.salePrice ?? prod.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(
                              prod,
                              1,
                              prod.flavors[0],
                              prod.sizes[0],
                              false
                            )
                          }
                          className="rounded-pill bg-brand-green px-3 py-1.5 text-[11px] font-bold text-white hover:bg-brand-green-dark shrink-0"
                        >
                          + Sumar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Columna Resumen de Compra */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="rounded-card-lg bg-brand-surface border border-brand-border p-6 shadow-soft space-y-5">
                <h2 className="font-display text-lg font-extrabold text-brand-ink border-b border-brand-border pb-3">
                  Resumen del Pedido
                </h2>

                {/* Código promocional */}
                <div>
                  <label className="block text-xs font-bold text-brand-ink mb-2">
                    ¿Tenés un cupón de descuento?
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-2xl bg-brand-green-soft p-3 text-xs text-brand-green-dark border border-brand-green/30">
                      <span className="font-bold flex items-center gap-1.5">
                        <Tag className="h-4 w-4" />
                        {appliedCoupon.code} (-{formatARS(cartDiscount)})
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="font-extrabold underline"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCouponSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Ingresá tu cupón"
                        className="flex-1 rounded-pill border border-brand-border bg-white px-3.5 py-2 text-xs font-semibold text-brand-ink focus:border-brand-green focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-pill bg-brand-ink px-4 py-2 text-xs font-bold text-white hover:bg-brand-green transition-colors"
                      >
                        Aplicar
                      </button>
                    </form>
                  )}
                  {couponMessage && !appliedCoupon && (
                    <p
                      className={`mt-1.5 text-[11px] font-semibold ${
                        couponMessage.ok
                          ? "text-brand-green-dark"
                          : "text-red-600"
                      }`}
                    >
                      {couponMessage.message}
                    </p>
                  )}
                </div>

                {/* Desglose de importes */}
                <div className="space-y-2.5 text-sm border-t border-brand-border pt-4">
                  <div className="flex justify-between text-brand-ink-muted">
                    <span>Subtotal de productos</span>
                    <span className="font-bold text-brand-ink">
                      {formatARS(cartSubtotal)}
                    </span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-brand-green-dark">
                      <span>Descuento cupón</span>
                      <span className="font-bold">
                        -{formatARS(cartDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-ink-muted">
                    <span>Envío ({db.settings.shippingCarrier})</span>
                    {shippingInfo.isFreeShipping ? (
                      <span className="font-extrabold text-brand-green-dark">
                        GRATIS ($0)
                      </span>
                    ) : (
                      <span className="font-bold text-brand-ink">
                        {formatARS(shippingInfo.shippingCost)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between border-t border-brand-border pt-3 text-base font-extrabold text-brand-ink">
                    <span>Total a pagar</span>
                    <span className="font-display text-2xl text-brand-green-dark">
                      {formatARS(cartTotal)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-pill bg-brand-green py-3.5 px-6 text-sm font-bold text-white hover:bg-brand-green-dark transition-colors shadow-soft"
                >
                  <span>Continuar al Checkout</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-brand-ink-muted pt-1">
                  <ShieldCheck className="h-4 w-4 text-brand-green" />
                  <span>Compra protegida · Mercado Pago y Transferencia</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

