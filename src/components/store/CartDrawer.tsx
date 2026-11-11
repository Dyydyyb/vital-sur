"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  CheckCircle2,
  ArrowRight,
  Tag,
} from "lucide-react";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS } from "@/lib/format";
import { ProductVectorArt } from "@/components/brand/ProductVectorArt";

export function CartDrawer() {
  const {
    db,
    cart,
    isCartOpen,
    setIsCartOpen,
    cartCount,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    shippingInfo,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
  } = useVitalSur();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCouponCode(couponInput);
    setCouponFeedback(res);
    if (res.ok) setCouponInput("");
  };

  return (
    <div
      className="fixed inset-0 z-[80] overflow-hidden no-print"
      aria-labelledby="cart-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Fondo oscuro suave */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-brand-ink/40 backdrop-blur-[2px] transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-soft-lg flex flex-col justify-between animate-fade-slide">
          {/* Cabecera del Carrito */}
          <div className="p-5 border-b border-brand-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green-soft text-brand-green-dark">
                  <ShoppingBag className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h2
                    id="cart-drawer-title"
                    className="font-display text-lg font-extrabold text-brand-ink"
                  >
                    Tu Carrito
                  </h2>
                  <p className="text-xs text-brand-ink-muted">
                    {cartCount}{" "}
                    {cartCount === 1
                      ? "producto seleccionado"
                      : "productos seleccionados"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                aria-label="Cerrar carrito"
                className="rounded-full p-2 text-brand-ink-muted hover:bg-brand-surface hover:text-brand-ink transition-colors"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Barra de progreso animada para Envío Gratis ($80.000 configurable) */}
            <div className="mt-4 rounded-card bg-brand-surface p-3.5 border border-brand-border">
              {shippingInfo.isFreeShipping ? (
                <div className="flex items-center gap-2.5 text-brand-green-dark">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-brand-green"
                    strokeWidth={2.2}
                  />
                  <p className="text-xs font-bold leading-snug">
                    ¡Felicitaciones! Alcanzaste el{" "}
                    <span className="underline">ENVÍO GRATIS</span> a todo el
                    país por {db.settings.shippingCarrier}.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-brand-ink">
                      <Truck
                        className="h-4 w-4 text-brand-green"
                        strokeWidth={2}
                      />
                      Te faltan{" "}
                      <strong className="font-extrabold text-brand-green-dark">
                        {formatARS(shippingInfo.remainingForFreeShipping)}
                      </strong>{" "}
                      para tener envío gratis
                    </span>
                    <span className="font-bold text-brand-ink-muted">
                      {shippingInfo.progressPercentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-pill bg-white border border-brand-border">
                    <div
                      className="h-full rounded-pill bg-brand-green transition-all duration-500 ease-natural"
                      style={{ width: `${shippingInfo.progressPercentage}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-brand-ink-muted">
                    Envío fijo {db.settings.shippingCarrier}:{" "}
                    <strong>{formatARS(db.settings.shippingCost)}</strong>{" "}
                    (Gratis superando{" "}
                    {formatARS(db.settings.freeShippingThreshold)})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-surface text-brand-ink-subtle mb-4">
                  <ShoppingBag className="h-9 w-9" strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-base font-bold text-brand-ink">
                  Tu carrito está vacío
                </h3>
                <p className="mt-1 max-w-xs text-xs text-brand-ink-muted leading-relaxed">
                  Sumá proteínas, creatinas o vitaminas de nuestra tienda de
                  Florencio Varela y recibilos en cualquier punto del país.
                </p>
                <Link
                  href="/productos"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 inline-flex items-center gap-2 rounded-pill bg-brand-green px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-green-dark transition-colors"
                >
                  <span>Explorar catálogo</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.flavor}-${item.size}`}
                  className="flex gap-3.5 rounded-card bg-brand-surface/70 p-3.5 border border-brand-border/80"
                >
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-white p-2 border border-brand-border/60">
                    <ProductVectorArt
                      type={item.illustrationType}
                      accentColor={item.accentColor}
                      brand={item.brand}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/productos/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-bold text-brand-ink hover:text-brand-green line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] font-medium text-brand-ink-muted mt-0.5">
                          {item.flavor} · {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.productId, item.flavor, item.size)
                        }
                        aria-label={`Eliminar ${item.name}`}
                        className="text-brand-ink-subtle hover:text-red-600 p-1 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-pill bg-white border border-brand-border px-1.5 py-0.5">
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
                          className="p-1 text-brand-ink hover:text-brand-green"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.2} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-brand-ink">
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
                          className="p-1 text-brand-ink hover:text-brand-green"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                        </button>
                      </div>

                      <span className="font-display text-sm font-extrabold text-brand-ink">
                        {formatARS(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumen y botones de acción */}
          {cart.length > 0 && (
            <div className="border-t border-brand-border bg-brand-surface/50 p-5 space-y-4">
              {/* Cupón */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-2xl bg-brand-green-soft px-3.5 py-2 text-xs text-brand-green-dark">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Tag className="h-3.5 w-3.5" strokeWidth={2} />
                    Cupón {appliedCoupon.code} aplicado (-
                    {formatARS(cartDiscount)})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="font-bold underline hover:text-brand-ink"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Código de cupón"
                    className="flex-1 rounded-pill border border-brand-border bg-white px-3.5 py-2 text-xs text-brand-ink placeholder:text-brand-ink-subtle focus:border-brand-green focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-pill bg-brand-ink px-4 py-2 text-xs font-bold text-white hover:bg-brand-green transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
              )}
              {couponFeedback && !appliedCoupon && (
                <p
                  className={`text-[11px] font-medium ${
                    couponFeedback.ok ? "text-brand-green-dark" : "text-red-600"
                  }`}
                >
                  {couponFeedback.message}
                </p>
              )}

              {/* Desglose de importes */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-brand-ink-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-ink">
                    {formatARS(cartSubtotal)}
                  </span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-brand-green-dark">
                    <span>Descuento por cupón</span>
                    <span className="font-semibold">
                      -{formatARS(cartDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-brand-ink-muted">
                  <span>Envío ({db.settings.shippingCarrier})</span>
                  {shippingInfo.isFreeShipping ? (
                    <span className="font-bold text-brand-green-dark">
                      GRATIS
                    </span>
                  ) : (
                    <span className="font-semibold text-brand-ink">
                      {formatARS(shippingInfo.shippingCost)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between border-t border-brand-border pt-2.5 text-base font-extrabold text-brand-ink">
                  <span>Total</span>
                  <span className="font-display text-xl text-brand-green-dark">
                    {formatARS(cartTotal)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/carrito"
                  onClick={() => setIsCartOpen(false)}
                  className="flex items-center justify-center rounded-pill border border-brand-border bg-white py-3 px-4 text-xs font-bold text-brand-ink hover:border-brand-green hover:text-brand-green transition-colors"
                >
                  Ver carrito completo
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-pill bg-brand-green py-3 px-4 text-xs font-bold text-white hover:bg-brand-green-dark transition-colors shadow-sm"
                >
                  <span>Iniciar compra</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

