import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint simulado de Mercado Pago Checkout Pro (Modo Prueba Sandbox).
 * Genera una preferencia de pago con ID de prueba y devuelve los datos
 * de simulación para completar el flujo de checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items = [], total = 0, payer = {} } = body;

    const preferenceId = `TEST-PREF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentReference = `MP-TEST-${Math.floor(10000000 + Math.random() * 90000000)}`;

    return NextResponse.json({
      ok: true,
      sandbox: true,
      preferenceId,
      paymentReference,
      collector: "VITAL SUR NUTRICION S.R.L. (Florencio Varela)",
      total,
      itemsCount: items.length,
      payerEmail: payer.email || "comprador@vitalsur.com.ar",
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error creando preferencia de Mercado Pago" },
      { status: 500 }
    );
  }
}

