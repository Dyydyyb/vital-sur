import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, verifyStaffCredentials } from "@/lib/auth";

// Rate limiter simple en memoria para mitigar fuerza bruta
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const record = loginAttempts.get(ip);
    if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Demasiados intentos fallidos. Esperá unos minutos antes de volver a intentar.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Ingresá tu correo y contraseña." },
        { status: 400 }
      );
    }

    const user = verifyStaffCredentials(email, password);
    if (!user) {
      const current = loginAttempts.get(ip);
      if (!current || current.resetAt <= now) {
        loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        loginAttempts.set(ip, {
          count: current.count + 1,
          resetAt: current.resetAt,
        });
      }
      return NextResponse.json(
        { ok: false, message: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    loginAttempts.delete(ip);
    const res = NextResponse.json({ ok: true, user });
    attachSessionCookie(res, user);
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Error procesando el inicio de sesión." },
      { status: 400 }
    );
  }
}

