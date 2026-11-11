import React from "react";
import { IllustrationType } from "@/lib/types";

interface ProductVectorArtProps {
  type: IllustrationType | string;
  accentColor?: string;
  brand?: string;
  view?: "front" | "nutrition" | "detail";
  className?: string;
}

/**
 * Ilustraciones 100% vectoriales (SVG) de suplementos y accesorios de Vital Sur.
 * Garantiza cero imágenes raster de decoración y una estética orgánica, limpia y profesional.
 */
export function ProductVectorArt({
  type,
  accentColor = "#2E9E6B",
  brand = "VITAL SUR",
  view = "front",
  className = "w-full h-full",
}: ProductVectorArtProps) {
  if (view === "nutrition") {
    return (
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Vista vectorial de tabla nutricional"
      >
        <rect x="20" y="16" width="200" height="208" rx="24" fill="#F6FAF8" stroke="#DCE8E2" strokeWidth="1.5" />
        <rect x="48" y="34" width="144" height="172" rx="16" fill="#FFFFFF" stroke="#1F2D2A" strokeWidth="1.8" />
        <rect x="60" y="48" width="120" height="20" rx="6" fill={accentColor} fillOpacity="0.16" />
        <path d="M68 58H140" stroke="#1F2D2A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M62 78H178" stroke="#1F2D2A" strokeWidth="2.5" />
        <path d="M62 94H130M152 94H176" stroke="#526660" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M62 110H140M156 110H176" stroke="#526660" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M62 126H122M150 126H176" stroke="#526660" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M62 142H136M154 142H176" stroke="#526660" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="62" y="160" width="116" height="30" rx="8" fill="#F6FAF8" stroke={accentColor} strokeWidth="1.4" />
        <circle cx="78" cy="175" r="6" fill={accentColor} />
        <path d="M92 172H164M92 179H142" stroke="#1F2D2A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (view === "detail") {
    return (
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Vista vectorial de pureza y dosificador"
      >
        <circle cx="120" cy="120" r="94" fill="#F6FAF8" stroke="#DCE8E2" strokeWidth="1.5" />
        <path d="M48 158C76 138 104 134 128 142C152 150 174 146 194 130" stroke="#7CC4E8" strokeWidth="3" strokeLinecap="round" />
        {/* Scoop / Cuchara medidora vectorial */}
        <path d="M66 122C66 96 86 80 112 80H136V124C136 144 120 158 100 158C80 158 66 142 66 122Z" fill="#FFFFFF" stroke="#1F2D2A" strokeWidth="2.2" />
        <path d="M136 96H188C193 96 196 100 196 104C196 108 193 112 188 112H136V96Z" fill={accentColor} stroke="#1F2D2A" strokeWidth="2" />
        {/* Polvo micronizado / pureza */}
        <path d="M76 80C86 66 108 64 126 80H76Z" fill={accentColor} fillOpacity="0.28" />
        <circle cx="96" cy="58" r="4" fill={accentColor} />
        <circle cx="114" cy="52" r="3" fill="#7CC4E8" />
        <circle cx="132" cy="62" r="3.5" fill={accentColor} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Fondo orgánico vectorial */}
      <circle cx="120" cy="124" r="86" fill="#F6FAF8" />
      <path
        d="M46 168C72 152 98 148 124 154C150 160 174 156 196 142"
        stroke="#7CC4E8"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Hoja decorativa sutil */}
      <path
        d="M178 68C178 54 190 46 204 48C204 62 192 70 178 68Z"
        fill={accentColor}
        fillOpacity="0.18"
      />

      {/* Variantes de envases según tipo de producto */}
      {(type === "whey-jar" || type === "combo-pack") && (
        <g>
          {/* Tapa rosca ancha */}
          <rect x="76" y="34" width="88" height="22" rx="7" fill="#1F2D2A" />
          <path d="M84 34V56M100 34V56M120 34V56M140 34V56M156 34V56" stroke="#364B46" strokeWidth="1.5" />
          {/* Cuello del pote */}
          <path d="M82 56H158L168 72H72L82 56Z" fill="#FFFFFF" stroke="#1F2D2A" strokeWidth="2" />
          {/* Cuerpo del pote */}
          <rect x="66" y="70" width="108" height="134" rx="20" fill="#FFFFFF" stroke="#1F2D2A" strokeWidth="2.2" />
          {/* Etiqueta central */}
          <rect x="68" y="92" width="104" height="84" fill={accentColor} fillOpacity="0.12" />
          <rect x="68" y="92" width="104" height="6" fill={accentColor} />
          <rect x="68" y="170" width="104" height="6" fill="#7CC4E8" />
          {/* Isotipo miniatura en etiqueta */}
          <circle cx="120" cy="116" r="12" fill="#FFFFFF" stroke={accentColor} strokeWidth="2" />
          <path d="M120 123V110C120 107 124 105 128 106C128 111 125 115 120 115" fill={accentColor} />
          {/* Líneas tipográficas limpias */}
          <rect x="88" y="135" width="64" height="7" rx="3.5" fill="#1F2D2A" />
          <rect x="96" y="147" width="48" height="5" rx="2.5" fill={accentColor} />
          <rect x="102" y="157" width="36" height="4" rx="2" fill="#526660" />
        </g>
      )}

      {(type === "creatine-tub" || type === "bcaa-powder" || type === "preworkout-tub" || type === "collagen-jar") && (
        <g>
          {/* Tapa cilíndrica mediana */}
          <rect x="78" y="54" width="84" height="18" rx="6" fill="#1F2D2A" />
          {/* Cuerpo pote compacto */}
          <rect x="72" y="72" width="96" height="122" rx="18" fill="#FFFFFF" stroke="#1F2D2A" strokeWidth="2.2" />
          {/* Franja de energía */}
          <path d="M74 104H166V164H74V104Z" fill={accentColor} fillOpacity="0.14" />
          <path d="M74 104H166" stroke={accentColor} strokeWidth="4" />
          <path d="M84 148C104 136 136 136 156 148" stroke="#7CC4E8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="122" r="10" fill={accentColor} />
          <path d="M117 122L120 116L123 122H117Z" fill="#FFFFFF" />
          <rect x="90" y="168" width="60" height="6" rx="3" fill="#1F2D2A" />
          <rect x="102" y="178" width="36" height="4" rx="2" fill="#526660" />
        </g>
      )}

      {(type === "vitamin-bottle" || type === "burner-bottle" || type === "omega-bottle" || type === "magnesium-bottle") && (
        <g>
          {/* Tapa de seguridad */}
          <rect x="92" y="44" width="56" height="18" rx="5" fill={accentColor} stroke="#1F2D2A" strokeWidth="2" />
          {/* Cuello frasco */}
          <path d="M98 62H142L152 80H88L98 62Z" fill="#F6FAF8" stroke="#1F2D2A" strokeWidth="2" />
          {/* Cuerpo frasco cápsulas */}
          <rect x="82" y="78" width="76" height="118" rx="16" fill="#FFFFFF" stroke="#1F2D2A" strokeWidth="2.2" />
          <rect x="84" y="102" width="72" height="68" fill={accentColor} fillOpacity="0.13" />
          {/* Icono hoja/cápsula */}
          <rect x="108" y="114" width="24" height="12" rx="6" fill={accentColor} />
          <rect x="94" y="136" width="52" height="6" rx="3" fill="#1F2D2A" />
          <rect x="102" y="147" width="36" height="4.5" rx="2.2" fill="#526660" />
          <circle cx="120" cy="160" r="3" fill="#7CC4E8" />
        </g>
      )}

      {type === "shaker-cup" && (
        <g>
          {/* Pico vertedor y tapa */}
          <path d="M108 34H136V46H108V34Z" fill={accentColor} stroke="#1F2D2A" strokeWidth="2" />
          <path d="M76 46H164L168 64H72L76 46Z" fill="#1F2D2A" />
          {/* Vaso mezclador cónico */}
          <path d="M78 64H162L150 194C149 200 144 204 138 204H102C96 204 91 200 90 194L78 64Z" fill="#FFFFFF" stroke="#1F2D2A" strokeWidth="2.2" />
          {/* Medidor mililitros */}
          <path d="M142 88H150M140 112H148M138 136H146M136 160H144" stroke="#7CC4E8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Logo vertical en shaker */}
          <circle cx="116" cy="124" r="16" fill={accentColor} fillOpacity="0.15" />
          <path d="M116 134V114C116 110 122 108 126 110C126 116 121 122 116 122" fill={accentColor} />
        </g>
      )}

      {type === "straps-gear" && (
        <g>
          {/* Par de cintas de agarre / accesorios de entrenamiento */}
          <rect x="64" y="72" width="112" height="38" rx="12" fill="#1F2D2A" />
          <rect x="74" y="82" width="44" height="18" rx="5" fill={accentColor} />
          <rect x="68" y="122" width="104" height="38" rx="12" fill="#237B53" />
          <rect x="118" y="132" width="42" height="18" rx="5" fill="#FFFFFF" />
          <path d="M90 176H150" stroke="#7CC4E8" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {/* Etiqueta de línea / marca en base */}
      <text
        x="120"
        y="222"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="9"
        fontWeight="700"
        letterSpacing="0.15em"
        fill="#526660"
      >
        {brand.toUpperCase()}
      </text>
    </svg>
  );
}

