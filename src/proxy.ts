import { NextResponse, type NextRequest } from "next/server";

import { crossOriginRejected } from "./lib/http/originCheck.ts";
import { SECURITY_HEADERS } from "./lib/http/securityHeaders.ts";

export function proxy(request: NextRequest) {
  const rejected = crossOriginRejected({
    method: request.method,
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    secFetchSite: request.headers.get("sec-fetch-site"),
  });

  const response = rejected
    ? new NextResponse("Nicht erlaubt.", { status: 403 })
    : NextResponse.next();

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  return response;
}

export const config = {
  matcher: "/:path*",
};
