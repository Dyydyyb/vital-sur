import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { StaffUser } from "./types";

export const STAFF_COOKIE_NAME = "vs_staff_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 horas

function getAuthSecret(): string {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
    return process.env.AUTH_SECRET;
  }
  // Derivación determinista en servidor si AUTH_SECRET no fue configurada aún en Vercel
  const seed =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "vital-sur-server-fallback-secret-key";
  return crypto.createHash("sha256").update(`vs-hmac:${seed}`).digest("hex");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Igualar tiempos de comparación aunque difiera la longitud
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyStaffCredentials(
  emailInput: string,
  passwordInput: string
): StaffUser | null {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput;

  const adminEmail = (
    process.env.CRM_ADMIN_EMAIL || "admin@vitalsur.com.ar"
  ).toLowerCase();
  const adminPassword = process.env.CRM_ADMIN_PASSWORD || "VitalSur2026!";

  const colabEmail = (
    process.env.CRM_COLLABORATOR_EMAIL || "colaborador@vitalsur.com.ar"
  ).toLowerCase();
  const colabPassword = process.env.CRM_COLLABORATOR_PASSWORD || "Varela2026!";

  if (timingSafeEqualStr(email, adminEmail) && timingSafeEqualStr(password, adminPassword)) {
    return {
      id: "staff-admin",
      name: "Martín Morales",
      email: adminEmail,
      role: "ADMIN",
      roleLabel: "Administrador General",
    };
  }

  if (timingSafeEqualStr(email, colabEmail) && timingSafeEqualStr(password, colabPassword)) {
    return {
      id: "staff-colab",
      name: "Sofía Duarte",
      email: colabEmail,
      role: "COLLABORATOR",
      roleLabel: "Colaboradora (Despacho y Stock)",
    };
  }

  return null;
}

interface SessionPayload {
  user: StaffUser;
  exp: number;
}

export function createSignedSessionToken(user: StaffUser): string {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySignedSessionToken(token: string | undefined): StaffUser | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getAuthSecret())
    .update(encoded)
    .digest("base64url");

  if (!timingSafeEqualStr(sig, expectedSig)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!parsed?.user || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed.user;
  } catch {
    return null;
  }
}

export function getStaffSessionFromRequest(req: NextRequest): StaffUser | null {
  const token = req.cookies.get(STAFF_COOKIE_NAME)?.value;
  return verifySignedSessionToken(token);
}

export function attachSessionCookie(res: NextResponse, user: StaffUser): void {
  const token = createSignedSessionToken(user);
  res.cookies.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(STAFF_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

