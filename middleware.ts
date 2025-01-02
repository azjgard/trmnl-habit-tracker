import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { validateInstancePassword } from "./app/api/lib";

export function middleware(request: NextRequest) {
  const search = new URLSearchParams(request.url.split("?")[1] ?? "");

  try {
    validateInstancePassword(search.get("ip"));
    return NextResponse.next();
  } catch (e) {
    console.error(e);
    return new NextResponse("Instance password required", { status: 400 });
  }
}

export const config = {
  matcher: "/",
};
