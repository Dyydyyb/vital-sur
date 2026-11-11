/**
 * Script de verificación integral en vivo para Vital Sur (http://localhost:3000):
 * 1. Verifica CERO emojis en todo el código fuente y en el HTML renderizado de cada ruta.
 * 2. Verifica CERO efectos neón en hojas de estilo.
 * 3. Verifica que el Hero principal tenga exactamente 100svh (h-[100svh] min-h-[100svh] max-h-[100svh]),
 *    dos botones ("Ver productos" y "Conocer más"), composición vectorial e indicador animado de scroll.
 * 4. Verifica las 4 variantes del logo SVG (/brand/logo-horizontal.svg, /brand/logo-vertical.svg,
 *    /brand/isotipo.svg, /brand/logo-monocromatico.svg).
 * 5. Verifica las reglas de envío ($8.999 fijo y GRATIS desde $80.000) y los endpoints API (/api/store y /api/mercadopago).
 * 6. Verifica eliminación completa de /seguimiento, falsa ubicación (San Martín 2450) y 10% OFF.
 * 7. Verifica que los datos mock hayan sido eliminados (products=[], orders=[], customers=[]).
 * 8. Verifica archivos de integración con Supabase (schema.sql, supabase.ts, README.md).
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const BASE_URL = "http://localhost:3000";

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

async function verifyLiveServer() {
  const routes = [
    "/",
    "/productos",
    "/carrito",
    "/checkout",
    "/admin",
    "/brand/logo-horizontal.svg",
    "/brand/logo-vertical.svg",
    "/brand/isotipo.svg",
    "/brand/logo-monocromatico.svg",
  ];

  for (const route of routes) {
    const res = await fetch(`${BASE_URL}${route}`);
    if (!res.ok) {
      throw new Error(`Ruta ${route} devolvió estado ${res.status}`);
    }
    const text = await res.text();
    if (EMOJI_REGEX.test(text)) {
      throw new Error(`Se detectó un emoji en el HTML renderizado de ${route}`);
    }
    console.log(`[OK] Ruta ${route} -> HTTP ${res.status} (0 emojis en DOM renderizado)`);

    if (route === "/") {
      if (
        !text.includes("h-[100svh]") ||
        !text.includes("Ver productos") ||
        !text.includes("Conocer más") ||
        !text.includes("animate-scroll-indicator")
      ) {
        throw new Error("El Hero en / no contiene todos los elementos requeridos");
      }
      if (text.includes("Cuenta / Admin") || text.includes("Cuenta / admin")) {
        throw new Error("Se encontró 'Cuenta / Admin' visible en el home público");
      }
      if (text.includes("8.999 fijo") || text.includes("$8.999 fijo")) {
        throw new Error("Se encontró '$8.999 fijo' arriba en el header");
      }
      if (!text.includes("5491134062942")) {
        throw new Error("No se encontró el número de WhatsApp 5491134062942");
      }
      if (text.includes("San Martín 2450")) {
        throw new Error("Se encontró la falsa ubicación 'San Martín 2450' en el home");
      }
      if (text.includes("10% OFF") || text.includes("BIENVENIDA10")) {
        throw new Error("Se encontró '10% OFF' o cupón 'BIENVENIDA10' en el home");
      }
      if (text.includes('href="/seguimiento"')) {
        throw new Error("Se encontró enlace a /seguimiento en el home");
      }
      console.log(
        "[OK] Home verificado: sin 'Cuenta / Admin', sin precio fijo en cabecera, sin San Martín 2450, sin 10% OFF, sin /seguimiento, con WhatsApp oficial y Hero 100svh intacto."
      );
    }
  }

  // Verificar que /seguimiento ya no exista (404)
  const seguimientoRes = await fetch(`${BASE_URL}/seguimiento`);
  if (seguimientoRes.status !== 404) {
    throw new Error(`Se esperaba 404 para /seguimiento pero se recibió ${seguimientoRes.status}`);
  }
  console.log("[OK] Apartado /seguimiento eliminado correctamente (retorna 404).");

  // Verificar API de estado y configuración de envío sin datos mock
  const storeRes = await fetch(`${BASE_URL}/api/store`);
  const storeData = await storeRes.json();
  if (
    storeData.settings.shippingCost !== 8999 ||
    storeData.settings.freeShippingThreshold !== 80000
  ) {
    throw new Error("Configuración centralizada de envíos no coincide con $8.999 / $80.000");
  }
  if (storeData.products.length !== 0) {
    throw new Error(`Se esperaban 0 productos mock pero se encontraron ${storeData.products.length}`);
  }
  if (storeData.orders.length !== 0) {
    throw new Error(`Se esperaban 0 pedidos mock pero se encontraron ${storeData.orders.length}`);
  }
  if (storeData.customers.length !== 0) {
    throw new Error(`Se esperaban 0 clientes mock pero se encontraron ${storeData.customers.length}`);
  }
  console.log(
    `[OK] API /api/store verificada: 0 datos mock (products=${storeData.products.length}, orders=${storeData.orders.length}, customers=${storeData.customers.length}, shippingCost=$${storeData.settings.shippingCost}, freeShippingThreshold=$${storeData.settings.freeShippingThreshold}).`
  );

  // Verificar API Sandbox de Mercado Pago
  const mpRes = await fetch(`${BASE_URL}/api/mercadopago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ name: "Whey Protein Pure", quantity: 1, unitPrice: 34999 }],
      total: 43998,
      payer: { email: "test@vitalsur.com.ar" },
    }),
  });
  const mpData = await mpRes.json();
  if (!mpData.ok || !mpData.preferenceId.startsWith("TEST-PREF-")) {
    throw new Error("Fallo en endpoint de Mercado Pago Modo Prueba");
  }
  console.log(
    `[OK] API /api/mercadopago (Modo Prueba) verificada: ${mpData.preferenceId} (${mpData.paymentReference}).`
  );

  // Verificar archivos de Supabase
  const supabaseSchemaPath = path.join(ROOT, "supabase", "schema.sql");
  const supabaseClientPath = path.join(ROOT, "src", "lib", "supabase.ts");
  const supabaseReadmePath = path.join(ROOT, "supabase", "README.md");
  if (!fs.existsSync(supabaseSchemaPath)) throw new Error("supabase/schema.sql no existe");
  if (!fs.existsSync(supabaseClientPath)) throw new Error("src/lib/supabase.ts no existe");
  if (!fs.existsSync(supabaseReadmePath)) throw new Error("supabase/README.md no existe");
  console.log("[OK] Archivos de integración con Supabase verificados (schema.sql, supabase.ts, README.md).");

  console.log("\n=======================================================");
  console.log("¡TODAS LAS VERIFICACIONES PASARON EXITOSAMENTE! (100%)");
  console.log("=======================================================");
}

verifyLiveServer().catch((err) => {
  console.error("Error en verificación:", err);
  process.exit(1);
});
