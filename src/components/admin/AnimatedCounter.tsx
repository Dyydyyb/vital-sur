"use client";

import React, { useEffect, useState } from "react";
import { formatARS } from "@/lib/format";

interface AnimatedCounterProps {
  value: number;
  isCurrency?: boolean;
  duration?: number;
}

/**
 * Contador animado suave (380ms) para métricas del panel CRM.
 * Respeta automáticamente prefers-reduced-motion.
 */
export function AnimatedCounter({
  value,
  isCurrency = false,
  duration = 420,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const initial = 0;
    const target = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing cubic-out natural
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(initial + (target - initial) * eased));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [value, duration]);

  return (
    <span>
      {isCurrency ? formatARS(displayValue) : displayValue.toLocaleString("es-AR")}
    </span>
  );
}

