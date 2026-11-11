/**
 * Utilidades de formato para pesos argentinos (ARS), fechas y cálculo centralizado de envíos.
 */

export function formatARS(amount: number): string {
  const rounded = Math.round(amount || 0);
  const formatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return rounded < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function formatDateAR(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
}

export function formatDateTimeAR(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoDate;
  }
}

export interface ShippingCalculation {
  isFreeShipping: boolean;
  shippingCost: number;
  remainingForFreeShipping: number;
  progressPercentage: number;
}

/**
 * Calcula el costo de envío según las reglas centralizadas de Vital Sur:
 * - Costo fijo por defecto: $8.999 a todo el país por Correo Argentino
 * - Envío GRATIS cuando el subtotal alcanza o supera el umbral ($80.000 por defecto)
 */
export function calculateShipping(
  subtotal: number,
  fixedShippingCost: number = 8999,
  freeShippingThreshold: number = 80000
): ShippingCalculation {
  if (subtotal <= 0) {
    return {
      isFreeShipping: false,
      shippingCost: 0,
      remainingForFreeShipping: freeShippingThreshold,
      progressPercentage: 0,
    };
  }

  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : fixedShippingCost;
  const remainingForFreeShipping = isFreeShipping
    ? 0
    : Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return {
    isFreeShipping,
    shippingCost,
    remainingForFreeShipping,
    progressPercentage,
  };
}

export const ARGENTINA_PROVINCES = [
  "Buenos Aires (GBA Sur)",
  "Buenos Aires (GBA Norte / Oeste)",
  "Buenos Aires (Interior)",
  "Ciudad Autónoma de Buenos Aires (CABA)",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

