import { NextRequest, NextResponse } from "next/server";

// Per FLIPMEET_STUDIO_GUIDE.md §9:
// - restrict uploaded file type/size (JPG/PNG/WEBP, 10MB cap)
// - never expose the AI provider key to the client — call it from here only
// - rate-limit this route (image-gen calls cost money per request)
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const photo = formData.get("photo");

  // TODO: validate file type/size
  // TODO: call AI try-on provider server-side
  // TODO: return generated image URL

  return NextResponse.json({ received: !!photo });
}
