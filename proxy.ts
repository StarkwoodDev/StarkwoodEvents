import { NextResponse, type NextRequest } from "next/server";

const OLD_HOST = "events.starkwood.au";
const NEW_HOST = "starkwood.au";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");

  if (host === OLD_HOST) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${NEW_HOST}`);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
