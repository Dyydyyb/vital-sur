import { NextRequest, NextResponse } from "next/server";
import { loadAuthoritativeDb } from "@/lib/store-service";
import { formatARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code || "").trim().toUpperCase();
    const subtotal = Number(body?.subtotal || 0);

    if (!code) {
      return NextResponse.json(
        { ok: false, message: "Ingresá un código de cupón." },
        { status: 400 }
      );
    }

    const db = await loadAuthoritativeDb();
    const found = db.coupons.find(
      (c) => c.code.toUpperCase() === code && c.active
    );

    if (!found) {
      return NextResponse.json(
        { ok: false, message: "El cupón no existe o no se encuentra activo." },
        { status: 404 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    if (found.expiresAt && found.expiresAt < today) {
      return NextResponse.json(
        { ok: false, message: "Este cupón ya venció." },
        { status: 400 }
      );
    }

    if (found.usedCount >= found.maxUses) {
      return NextResponse.json(
        { ok: false, message: "Este cupón alcanzó el límite máximo de usos." },
        { status: 400 }
      );
    }

    if (subtotal < found.minPurchase) {
      return NextResponse.json(
        {
          ok: false,
          message: `Compra mínima requerida: ${formatARS(found.minPurchase)}.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Cupón ${found.code} aplicado correctamente.`,
      coupon: found,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No se pudo validar el cupón." },
      { status: 500 }
    );
  }
}

