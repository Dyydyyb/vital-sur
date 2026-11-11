"use client";

import React from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useVitalSur } from "@/context/VitalSurContext";

export function ToastNotification() {
  const { toast, dismissToast } = useVitalSur();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[90] max-w-md animate-fade-slide no-print"
    >
      <div className="flex items-start gap-3.5 rounded-card bg-white p-4 shadow-soft-lg border border-brand-border">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            toast.type === "info"
              ? "bg-brand-blue-light text-brand-blue-dark"
              : toast.type === "warning"
              ? "bg-amber-50 text-amber-700"
              : "bg-brand-green-soft text-brand-green-dark"
          }`}
        >
          {toast.type === "info" ? (
            <Info className="h-5 w-5" strokeWidth={2} />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="h-5 w-5" strokeWidth={2} />
          ) : (
            <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1 pr-2">
          <p className="text-sm font-bold text-brand-ink">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-brand-ink-muted leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={dismissToast}
          aria-label="Cerrar notificación"
          className="rounded-full p-1 text-brand-ink-subtle hover:bg-brand-surface hover:text-brand-ink transition-colors duration-200"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

