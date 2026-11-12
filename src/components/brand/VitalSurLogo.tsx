import React from "react";

export type LogoVariant = "horizontal" | "vertical" | "isotipo" | "monocromatico";

interface VitalSurLogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Componente oficial de identidad de marca para Vital Sur (Florencio Varela).
 * Renderiza el logo oficial vectorizado y optimizado en sus variantes
 * horizontal, vertical, isotipo y monocromático.
 */
export function VitalSurLogo({
  variant = "horizontal",
  className = "",
  size = "md",
}: VitalSurLogoProps) {
  const isMono = variant === "monocromatico";

  if (variant === "isotipo") {
    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-14 w-14",
      xl: "h-20 w-20",
    }[size];

    return (
      <div className={`inline-flex items-center justify-center shrink-0 group ${className}`}>
        <img
          src="/brand/isotipo.png"
          alt="Vital Sur Isotipo"
          className={`${sizeClasses} object-contain transition-transform duration-300 ease-natural group-hover:scale-105`}
        />
      </div>
    );
  }

  if (variant === "vertical") {
    const sizeClasses = {
      sm: "h-14 sm:h-16",
      md: "h-20 sm:h-24",
      lg: "h-28 sm:h-32",
      xl: "h-36 sm:h-40",
    }[size];

    return (
      <div className={`inline-flex flex-col items-center text-center shrink-0 group ${className}`}>
        <img
          src="/brand/logo-vertical.png"
          alt="Vital Sur - Nutrición & Bienestar"
          className={`${sizeClasses} w-auto object-contain transition-transform duration-300 ease-natural group-hover:scale-105`}
        />
      </div>
    );
  }

  // Horizontal (default) o Monocromático
  const sizeClasses = {
    sm: "h-9 sm:h-10",
    md: "h-11 sm:h-12",
    lg: "h-14 sm:h-16",
    xl: "h-18 sm:h-20",
  }[size];

  return (
    <div className={`inline-flex items-center shrink-0 select-none group ${className}`}>
      <img
        src="/brand/logo-horizontal.png"
        alt="Vital Sur - Nutrición & Bienestar"
        className={`${sizeClasses} w-auto object-contain ${
          isMono ? "grayscale contrast-125 opacity-90" : ""
        } transition-transform duration-300 ease-natural group-hover:scale-[1.02]`}
      />
    </div>
  );
}
