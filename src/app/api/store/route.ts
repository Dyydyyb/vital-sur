import { NextRequest, NextResponse } from "next/server";
import { INITIAL_DB_STATE } from "@/lib/initial-data";
import { DatabaseState } from "@/lib/types";
import { getStaffSessionFromRequest } from "@/lib/auth";
import {
  loadAuthoritativeDb,
  persistFullStateToDb,
  StoreConflictError,
} from "@/lib/store-service";
import { writeDatabase } from "@/lib/server-db";
import { isSupabaseConfigured, getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getStaffSessionFromRequest(req);
    const db = await loadAuthoritativeDb();

    if (session) {
      return NextResponse.json(db);
    }

    // Visitante público: ocultar PII de clientes, pedidos, movimientos, cupones y costos internos
    const publicState: DatabaseState = {
      settings: db.settings,
      categories: db.categories,
      products: db.products.map((p) => ({
        ...p,
        cost: 0,
      })),
      orders: [],
      customers: [],
      stockMovements: [],
      coupons: [],
    };

    return NextResponse.json(publicState);
  } catch (error) {
    console.error("Error leyendo Vital Sur DB:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la información de la tienda" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getStaffSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Iniciá sesión en el panel de administración." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (body?.action === "RESET_DEMO") {
      if (session.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Solo un Administrador puede reiniciar la base de datos." },
          { status: 403 }
        );
      }

      const reset = writeDatabase(INITIAL_DB_STATE);
      if (isSupabaseConfigured()) {
        const client = getSupabaseAdmin();
        if (client) {
          await Promise.all([
            client.from("order_items").delete().neq("id", "none"),
            client.from("stock_movements").delete().neq("id", "none"),
            client.from("orders").delete().neq("id", "none"),
            client.from("products").delete().neq("id", "none"),
            client.from("customers").delete().neq("id", "none"),
            client.from("coupons").delete().neq("id", "none"),
          ]);
        }
      }
      return NextResponse.json(reset);
    }

    if (body?.state) {
      const nextState = body.state as DatabaseState;
      const synced = await persistFullStateToDb(nextState);
      return NextResponse.json(synced);
    }

    return NextResponse.json(
      { error: "Solicitud inválida" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof StoreConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Error updating Vital Sur DB:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la base de datos",
      },
      { status: 500 }
    );
  }
}
