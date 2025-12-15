import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_req: NextRequest) {
  // Do nothing; allow requests through
  return NextResponse.next();
}

export const config = {
  // Run on pages, not on Next internals / static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
