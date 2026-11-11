import React from "react";
import {
  Dumbbell,
  Zap,
  Flame,
  ShieldPlus,
  Activity,
  HeartPulse,
  CupSoda,
  Leaf,
  Sparkles,
  Package,
} from "lucide-react";
import { CategoryIconName } from "@/lib/types";

interface CategoryIconProps {
  name: CategoryIconName | string;
  className?: string;
  strokeWidth?: number;
}

export function CategoryIcon({
  name,
  className = "w-6 h-6",
  strokeWidth = 1.85,
}: CategoryIconProps) {
  switch (name) {
    case "dumbbell":
      return <Dumbbell className={className} strokeWidth={strokeWidth} />;
    case "zap":
      return <Zap className={className} strokeWidth={strokeWidth} />;
    case "flame":
      return <Flame className={className} strokeWidth={strokeWidth} />;
    case "shield-plus":
      return <ShieldPlus className={className} strokeWidth={strokeWidth} />;
    case "activity":
      return <Activity className={className} strokeWidth={strokeWidth} />;
    case "heart-pulse":
      return <HeartPulse className={className} strokeWidth={strokeWidth} />;
    case "cup-soda":
      return <CupSoda className={className} strokeWidth={strokeWidth} />;
    case "leaf":
      return <Leaf className={className} strokeWidth={strokeWidth} />;
    case "sparkles":
      return <Sparkles className={className} strokeWidth={strokeWidth} />;
    default:
      return <Package className={className} strokeWidth={strokeWidth} />;
  }
}

/**
 * Ícono SVG vectorial para WhatsApp (trazo y relleno limpio sin emojis)
 */
export function WhatsAppSvg({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

/**
 * Ícono SVG vectorial para Correo Argentino / Envíos Nacionales
 */
export function CorreoArgentinoBadgeSvg({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="6" width="28" height="20" rx="5" fill="#EBF6FC" stroke="#52A8D4" strokeWidth="1.8" />
      <path d="M7 13H21L18 19H5L7 13Z" fill="#7CC4E8" fillOpacity="0.35" />
      <path d="M8 12H23M8 16H20M8 20H16" stroke="#1F2D2A" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24" cy="18" r="2.5" fill="#2E9E6B" />
    </svg>
  );
}

