import { NextRequest, NextResponse } from "next/server";
import { getStaffSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = getStaffSessionFromRequest(req);
  return NextResponse.json({ user });
}

