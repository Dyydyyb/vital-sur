import React from "react";

export type LogoVariant = "horizontal" | "vertical" | "isotipo" | "monocromatico";

interface VitalSurLogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Componente oficial de identidad de marca para Vital Sur (Florencio Varela).
 * Concepto: Brote orgánico de vitalidad + arco solar y horizonte austral de Zona Sur.
 * Diseñado con protección contra encogimiento (shrink-0) y wrap (whitespace-nowrap)
 * para garantizar visualización perfecta en cualquier resolución.
 */
export function VitalSurLogo({
  variant = "horizontal",
  className = "",
  size = "md",
}: VitalSurLogoProps) {
  const isMono = variant === "monocromatico";

  // Isotipo SVG limpio, geométricamente equilibrado y de alta fidelidad
  const IsotipoSvg = ({
    boxSize = 42,
    mono = false,
  }: {
    boxSize?: number;
    mono?: boolean;
  }) => (
    <svg
      width={boxSize}
      height={boxSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-300 ease-natural group-hover:scale-105"
    >
      {/* Fondo orgánico con bordes redondeados suaves */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="14"
        fill={mono ? "none" : "#F6FAF8"}
        stroke={mono ? "currentColor" : "#DCE8E2"}
        strokeWidth={mono ? "2" : "1.25"}
      />

      {/* Sol naciente / Horizonte austral del sur */}
      <path
        d="M10 33C14.5 28 19.5 26 24 26C28.5 26 33.5 28 38 33"
        stroke={mono ? "currentColor" : "#7CC4E8"}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M13.5 38C17 35 20.5 34 24 34C27.5 34 31 35 34.5 38"
        stroke={mono ? "currentColor" : "#52A8D4"}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={mono ? 0.75 : 1}
      />

      {/* Hoja principal derecha de vitalidad */}
      <path
        d="M24 34V16C24 11 29 8 36 9C36 17 31.5 23 24 24Z"
        fill={mono ? "currentColor" : "#2E9E6B"}
      />

      {/* Hoja secundaria izquierda de equilibrio natural */}
      <path
        d="M24 29C18 28.2 14 23.5 14 17.5C19.5 17 23 20.2 24 25.5Z"
        fill={mono ? "currentColor" : "#3BB57E"}
        opacity={mono ? 0.8 : 1}
      />

      {/* Tallo central y nodo de energía */}
      <path
        d="M24 35V15"
        stroke={mono ? "currentColor" : "#1A5E3F"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="10.5"
        r="2"
        fill={mono ? "currentColor" : "#2E9E6B"}
      />
    </svg>
  );

  const dimensions = {
    sm: { box: 38, textClass: "text-lg", subClass: "text-[9px]" },
    md: { box: 44, textClass: "text-xl", subClass: "text-[10px]" },
    lg: { box: 52, textClass: "text-2xl", subClass: "text-[11px]" },
    xl: { box: 64, textClass: "text-3xl", subClass: "text-xs" },
  }[size];

  if (variant === "isotipo") {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 group ${className}`}
      >
        <IsotipoSvg mono={false} boxSize={dimensions.box} />
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div
        className={`inline-flex flex-col items-center text-center gap-2 shrink-0 select-none whitespace-nowrap group ${className}`}
      >
        <IsotipoSvg mono={false} boxSize={dimensions.box + 6} />
        <div className="flex flex-col items-center leading-tight">
          <span
            className={`font-display font-extrabold tracking-tight text-brand-ink ${dimensions.textClass}`}
          >
            VITAL <span className="text-brand-green">SUR</span>
          </span>
          <span
            className={`mt-0.5 font-bold uppercase tracking-[0.18em] text-brand-ink-muted ${dimensions.subClass}`}
          >
            Nutrición &amp; Bienestar
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 shrink-0 select-none whitespace-nowrap group ${
        isMono ? "text-brand-ink" : ""
      } ${className}`}
    >
      <IsotipoSvg mono={isMono} boxSize={dimensions.box} />
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-display font-extrabold tracking-tight ${
            isMono ? "text-current" : "text-brand-ink"
          } ${dimensions.textClass}`}
        >
          VITAL{" "}
          <span className={isMono ? "text-current" : "text-brand-green"}>
            SUR
          </span>
        </span>
        <span
          className={`mt-1 font-bold uppercase tracking-[0.16em] ${
            isMono ? "text-current opacity-80" : "text-brand-ink-muted"
          } ${dimensions.subClass}`}
        >
          Nutrición &amp; Bienestar
        </span>
      </div>
    </div>
  );
}
