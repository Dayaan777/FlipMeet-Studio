import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const redirectUrl = new URL("/admin", request.url);
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set({
    name: "admin_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
