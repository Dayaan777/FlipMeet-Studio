import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gqazaajfycutqildyrqw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: {
      persistSession: false,
    },
  });
}

// Server-side authentication check
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return session === "authenticated";
}

// POST: Create or Update a product (authenticated admin only)
export async function POST(request: Request) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session cookie required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, category, price, stock, sizes, images, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Product ID and name are required." },
        { status: 400 }
      );
    }

    const payload = {
      id: String(id).trim(),
      name: String(name).trim(),
      category: String(category || "DROP 001").trim(),
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      sizes: Array.isArray(sizes) ? sizes : ["S", "M", "L", "XL"],
      images: Array.isArray(images) ? images : [`/images/looks/${id}.jpg`],
      description: String(description || "").trim(),
    };

    const supabaseAdmin = getAdminClient();

    // If service role key is configured, use direct table upsert
    if (serviceRoleKey) {
      const { data, error } = await supabaseAdmin
        .from("products")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, product: data });
    }

    // Fallback: Call database SECURITY DEFINER RPC
    const { data, error } = await supabaseAdmin.rpc("admin_upsert_product", {
      p_id: payload.id,
      p_name: payload.name,
      p_category: payload.category,
      p_price: payload.price,
      p_stock: payload.stock,
      p_sizes: payload.sizes,
      p_images: payload.images,
      p_description: payload.description,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save product.";
    console.error("Admin products POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Delete a product (authenticated admin only)
export async function DELETE(request: Request) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session cookie required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // If service role key is configured, use direct table delete
    if (serviceRoleKey) {
      const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, id });
    }

    // Fallback: Call database SECURITY DEFINER RPC
    const { data, error } = await supabaseAdmin.rpc("admin_delete_product", {
      p_id: id,
    });

    if (error) throw error;
    return NextResponse.json({ success: true, deleted: data, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    console.error("Admin products DELETE error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
