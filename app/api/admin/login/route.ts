import { NextResponse } from "next/server";

const VALID_PASSWORD = process.env.ADMIN_PASSWORD || "type password here";

export async function POST(request: Request) {
  let password = "";
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      password = body.password || "";
    } catch {
      password = "";
    }
  } else {
    try {
      const formData = await request.formData();
      password = (formData.get("password") as string) || "";
    } catch {
      password = "";
    }
  }

  if (password === VALID_PASSWORD) {
    const isProduction = process.env.NODE_ENV === "production";

    // If client requested via JSON
    if (contentType.includes("application/json")) {
      const response = NextResponse.json({ success: true, redirect: "/admin" });
      response.cookies.set({
        name: "admin_session",
        value: "authenticated",
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      });
      return response;
    }

    // If submitted via standard HTML form POST
    const redirectUrl = new URL("/admin", request.url);
    const response = NextResponse.redirect(redirectUrl, 303);
    response.cookies.set({
      name: "admin_session",
      value: "authenticated",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isProduction,
    });
    return response;
  }

  // Invalid password
  if (contentType.includes("application/json")) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const redirectUrl = new URL("/admin?error=invalid_password", request.url);
  return NextResponse.redirect(redirectUrl, 303);
}
