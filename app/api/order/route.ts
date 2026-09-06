import { NextRequest, NextResponse } from "next/server";

// Per FLIPMEET_STUDIO_GUIDE.md §4.4 and §9:
// - validate input server-side before writing anywhere
// - write to Supabase (wired up when Supabase is set up)
// - rate-limit this route in production
export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: validate body (name, phone, address, items)
  // TODO: write order to Supabase
  // TODO: return data needed to build the WhatsApp deep link

  return NextResponse.json({ received: true, body });
}
