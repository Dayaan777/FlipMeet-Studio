import { supabase } from "@/lib/supabase";
import { Look, Drop, drops } from "@/data/drops";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  sizes: string[];
  stock: number;
  images: string[];
  description: string;
  created_at?: string;
};

export function productToLook(product: Product): Look {
  return {
    id: product.id,
    slug: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price) || 18500,
    sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL"],
    images:
      product.images && product.images.length > 0
        ? product.images
        : [`/images/looks/${product.id}.jpg`],
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Supabase products fetch warning:", error.message);
      }
      return getFallbackProducts();
    }

    return data.map((item) => ({
      ...item,
      price: Number(item.price),
    }));
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return getFallbackProducts();
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      const fallback = drops[0].looks.find((l) => l.id === id || l.slug === id);
      if (!fallback) return null;
      return {
        id: fallback.id,
        name: fallback.name,
        category: "DROP 001",
        price: fallback.price || 18500,
        sizes: fallback.sizes,
        stock: 100,
        images: fallback.images,
        description: fallback.description,
      };
    }

    return {
      ...data,
      price: Number(data.price),
    };
  } catch (err) {
    console.error("Error fetching product by id from Supabase:", err);
    return null;
  }
}

export async function getSupabaseDrop(): Promise<Drop> {
  const baseDrop = drops[0];
  const products = await getProducts();
  const looks = products.map(productToLook);

  return {
    ...baseDrop,
    looks,
  };
}

function getFallbackProducts(): Product[] {
  return drops[0].looks.map((l) => ({
    id: l.id,
    name: l.name,
    category: "DROP 001",
    price: l.price || 18500,
    sizes: l.sizes,
    stock: 100,
    images: l.images,
    description: l.description,
  }));
}
