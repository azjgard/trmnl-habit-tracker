import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { validateInstancePassword } from "./app/api/lib";

export function middleware(request: NextRequest) {
  const search = new URLSearchParams(request.url.split("?")[1] ?? "");
  const instancePassword = search.get("ip");

  try {
    validateInstancePassword(instancePassword);
    return NextResponse.next();
  } catch (e) {
    const msg = `Invalid instance password '${instancePassword}' in middleware`;
    console.error(msg, e);
    return new NextResponse("Instance password required", { status: 400 });
  }
}

export const config = {
  matcher: "/",
};
