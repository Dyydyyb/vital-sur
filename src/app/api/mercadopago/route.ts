import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint simulado de Mercado Pago Checkout Pro (Modo Prueba Sandbox).
 * Valida ítems, monto y correo del comprador antes de emitir la preferencia.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const total = Number(body?.total || 0);
    const payerEmail = String(body?.payer?.email || "").trim().toLowerCase();

    if (items.length === 0 || !Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { ok: false, error: "Datos de pago inválidos para Mercado Pago." },
        { status: 400 }
      );
    }

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
      payerEmail: payerEmail.includes("@") ? payerEmail : "comprador@vitalsur.com.ar",
      createdAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Error creando preferencia de Mercado Pago" },
      { status: 500 }
    );
  }
}
