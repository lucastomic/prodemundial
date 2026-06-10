import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db";

// Enlace para retomar la porra desde otro dispositivo: /resume?t=<token>
export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("t") || "";
  const user = token ? getUser(token) : undefined;
  if (!user) {
    return NextResponse.redirect(new URL("/?error=enlace", req.url));
  }
  const res = NextResponse.redirect(new URL("/porra", req.url));
  res.cookies.set("porra_uid", user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
