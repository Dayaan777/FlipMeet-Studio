import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gqazaajfycutqildyrqw.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

const supabase = createClient(supabaseUrl, anonKey);

// IDs of the 5 bundle outfits
const ANIME_PRODUCT_IDS = [
  "anime-luffy-blue-jersey",
  "anime-luffy-blue-outfit",
  "anime-gojo-jersey",
  "anime-gojo-outfit",
  "anime-robin-purple-jersey",
  "anime-robin-purple-outfit",
  "anime-zoro-green-jersey",
  "anime-zoro-green-outfit",
  "anime-op-flame-jersey",
  "anime-op-flame-outfit",
];

function parseSizeVariants(sizes: string[]) {
  if (!sizes || sizes.length === 0) return [];
  return sizes.map((s) => {
    try {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === "object" && "size" in parsed) {
        return parsed as { size: string; stock: number; isDefault?: boolean };
      }
    } catch (_) {}
    return { size: s, stock: 100, isDefault: false };
  });
}

export async function GET() {
  try {
    // Fetch bundle product (is_bundle = true) — server-side price only
    const { data: bundleData } = await supabase
      .from("products")
      .select("id, name, price, old_price, images")
      .eq("is_bundle", true)
      .maybeSingle();

    // Fetch individual anime products
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, price, old_price, images, category, sizes")
      .in("id", ANIME_PRODUCT_IDS);

    const bundle = bundleData
      ? {
          id: bundleData.id,
          name: bundleData.name,
          price: Number(bundleData.price),
          old_price: bundleData.old_price ? Number(bundleData.old_price) : undefined,
          images: bundleData.images || ["/images/anime-bundle.png"],
        }
      : null;

    const products = (productsData || []).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      old_price: p.old_price ? Number(p.old_price) : undefined,
      images: p.images || [],
      category: p.category,
      sizeVariants: parseSizeVariants(p.sizes || []),
    }));

    return NextResponse.json({ bundle, products }, { status: 200 });
  } catch (err) {
    console.error("anime-products API error:", err);
    return NextResponse.json({ bundle: null, products: [] }, { status: 200 });
  }
}
