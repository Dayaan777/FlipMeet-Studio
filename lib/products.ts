import { supabase } from "@/lib/supabase";
import { Look, Drop, drops } from "@/data/drops";

export type SizeVariant = {
  size: string;
  stock: number;
  isDefault?: boolean;
type?: "top" | "bottom";
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  old_price?: number;
  sizes: string[];
  stock: number;
  images: string[];
  cover_image?: string;
  secondary_images?: string[];
  description: string;
  created_at?: string;
  set_id?: string | null;
  specs?: string[];
  sizeVariants?: SizeVariant[];
  is_bundle?: boolean;
};

/** Parses the sizes array from Supabase. Each element may be a plain size string
 *  (e.g. "M") or a JSON-serialized SizeVariant object. Always returns clean SizeVariants. */
export function parseSizeVariants(sizes: string[]): SizeVariant[] {
  if (!sizes || sizes.length === 0) return [];
  return sizes.map((s) => {
    try {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === "object" && "size" in parsed) {
        if (!parsed.type) { const isNumeric = !isNaN(Number(parsed.size)); parsed.type = isNumeric ? "bottom" : "top"; } return parsed as SizeVariant;
      }
    } catch (_) {}
    // Plain string size — default stock of 100
    const isNumeric = !isNaN(Number(s)); return { size: s, stock: 100, isDefault: false, type: isNumeric ? "bottom" : "top" };
  });
}

/** Converts SizeVariant array back to the string[] format stored in Supabase. */
export function serializeSizeVariants(variants: SizeVariant[]): string[] {
  return variants.map((v) => JSON.stringify(v));
}

/** Returns the primary cover image URL for a product (index 0 of images array or fallback). */
export function getProductCoverImage(product: { id: string; images?: string[]; cover_image?: string }): string {
  if (product.cover_image) {
    return product.cover_image;
  }
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  return `/images/looks/${product.id}.jpg`;
}

/** Returns the secondary images URLs for a product (indices 1..N of images array). */
export function getProductSecondaryImages(product: { id?: string; images?: string[]; secondary_images?: string[] }): string[] {
  if (product.secondary_images && product.secondary_images.length > 0) {
    return product.secondary_images.filter(Boolean);
  }
  if (product.images && product.images.length > 1) {
    return product.images.slice(1).filter(Boolean);
  }
  return [];
}


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


export async function getProducts(options?: { includeBundles?: boolean }): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .neq("category", "SYSTEM")
      .order("id", { ascending: true });
    if (!options?.includeBundles) {
      query = query.neq("is_bundle", true);
    }
    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Supabase products fetch warning:", error.message);
      }
      return getFallbackProducts();
    }

    return data.map((item) => ({
      ...item,
      price: Number(item.price),
      old_price: item.old_price ? Number(item.old_price) : undefined,
      sizeVariants: parseSizeVariants(item.sizes || []),
      is_bundle: !!item.is_bundle,
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
      const fallback = getFallbackProducts().find((p) => p.id === id);
      return fallback || null;
    }

    return {
      ...data,
      price: Number(data.price),
      old_price: data.old_price ? Number(data.old_price) : undefined,
      sizeVariants: parseSizeVariants(data.sizes || []),
      is_bundle: !!data.is_bundle,
    };
  } catch (err) {
    console.error("Error fetching product by id from Supabase:", err);
    return getFallbackProducts().find((p) => p.id === id) || null;
  }
}

export async function getProductsBySetId(setId: string, excludeId?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from("products")
      .select("*")
      .eq("set_id", setId);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.order("category", { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn("Supabase getProductsBySetId warning:", error.message);
      return getFallbackProducts().filter((p) => p.set_id === setId && p.id !== excludeId);
    }

    return data.map((item) => ({
      ...item,
      price: Number(item.price),
    }));
  } catch (err) {
    console.error("Error fetching set products from Supabase:", err);
    return getFallbackProducts().filter((p) => p.set_id === setId && p.id !== excludeId);
  }
}

export async function getSupabaseDrop(): Promise<Drop> {
  const baseDrop = drops[0];
  const products = await getProducts();
  const outfitProducts = products.filter(
    (p) => p.category === "Outfits" && !(p.set_id && p.set_id.startsWith("anime"))
  );
  const looks = outfitProducts.map(productToLook);

  return {
    ...baseDrop,
    looks,
  };
}

function getFallbackProducts(): Product[] {
  const newProducts: Product[] = [
    {
      id: "limited-edition-1996-red-outfit",
      name: "Limited Edition 1996 Red Suit",
      category: "Outfits",
      price: 39000,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-red-outfit.png",
        "/images/products/limited-edition-1996-red-outfit.png",
      ],
      description:
        "Two-piece bespoke ensemble pairing the signature 1996 quarter-zip burgundy polo with pleated chalk-white corduroy trousers.",
      specs: [
        "Includes both the 1996 Quarter-Zip Polo and Wide-Leg Pleated Corduroy Trousers",
        "Heavyweight 320 GSM combed cotton piqué paired with 11-wale premium cotton corduroy",
        "Custom antiqued metal zipper hardware & high-density crest embroidery",
        "Numbered studio archive label (1 of 100) with certificate of authenticity",
        "Packaged in double-tier matte black FlipMeet Studio archive box",
      ],
      set_id: "limited-edition-1996-red",
    },
    {
      id: "limited-edition-1996-red-shirt",
      name: "1996 Vintage Red Quarter-Zip Polo",
      category: "Shirts",
      price: 23500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-red-shirt.png",
        "/images/products/limited-edition-1996-red-shirt.png",
      ],
      description:
        "Retro colorblocked quarter-zip polo in deep vintage crimson and crisp ivory, featuring archival 1996 crest embroidery and custom metal zipper.",
      specs: [
        "Heavyweight 320 GSM combed cotton piqué with dual-tone contrast blocking",
        "Archival 1996 script and heritage polo crest high-density embroidery",
        "Matte oxidized gunmetal quarter-zip hardware with reinforced placket",
        "Relaxed boxy silhouette with dropped shoulders and ribbed knit collar",
        "Limited run of 100 numbered pieces worldwide",
      ],
      set_id: "limited-edition-1996-red",
    },
    {
      id: "limited-edition-1996-red-trouser",
      name: "Chalk White Pleated Corduroy Trousers",
      category: "Trousers",
      price: 20500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-red-trouser.png",
        "/images/products/limited-edition-1996-red-trouser.png",
      ],
      description:
        "Wide-leg fluid silhouette crafted from ultra-soft chalk white corduroy, detailed with front permanent stitched crease and elasticated drawstring waist.",
      specs: [
        "Premium 11-wale ultra-soft cotton corduroy in vintage chalk white",
        "Permanent front vertical crease pin-tucking for tailored drape",
        "Encased elastic waistband with tonal tubular drawstrings & metal aglets",
        "Deep slash side pockets and dual welted rear pockets",
        "Architectural wide-leg puddle hem designed for sneakers or boots",
      ],
      set_id: "limited-edition-1996-red",
    },
    {
      id: "dreamer-outfit",
      name: "Dreamer 84 Heavyweight Suite",
      category: "Outfits",
      price: 39000,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-outfit.png",
        "/images/products/dreamer-outfit.png",
      ],
      description:
        "Two-piece street athletic suit featuring the oversized Dreamer 84 mesh v-neck jersey styled with deep indigo wide-leg cargo denim.",
      specs: [
        "Includes both the Dreamer 84 Mesh Jersey and Wide-Leg Cargo Denim Pants",
        "Heavyweight 300 GSM breathable performance poly-mesh paired with 14oz raw indigo denim",
        "Screenprinted tackle-twill numerals and double-layer star sleeve graphics",
        "Multi-pocket tactical cargo utility styling with antiqued brass hardware",
        "Packaged in custom matte black FlipMeet Studio archive box with serialized card (1 of 100)",
      ],
      set_id: "dreamer",
    },
    {
      id: "dreamer-jersey",
      name: "Dreamer 84 Mesh Football Jersey",
      category: "Jerseys",
      price: 23500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-jersey.png",
        "/images/products/dreamer-jersey.png",
      ],
      description:
        "Archival deep navy grid-mesh jersey with high-contrast 84 chest graphic, dual-stripe sleeve hits, embroidered star emblems, and thick ribbed v-neck collar.",
      specs: [
        "Heavyweight 300 GSM dual-layer athletic micro-mesh construction",
        "High-density tackle-twill 84 chest numbering with safety orange border",
        "Contrast rib-knit v-neck collar and reinforced shoulder yoke",
        "Oversized boxy streetwear drop-shoulder fit",
        "Numbered studio edition of 100 worldwide",
      ],
      set_id: "dreamer",
    },
    {
      id: "dreamer-pants",
      name: "Archival Indigo Cargo Denim Pants",
      category: "Pants",
      price: 20500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-pants.png",
        "/images/products/dreamer-pants.png",
      ],
      description:
        "Wide-leg carpenter cargo pants cut from rigid 14oz deep indigo denim with utility bellows pockets and tobacco topstitching.",
      specs: [
        "Rigid 14oz washed indigo ring-spun cotton denim",
        "Dual pleated bellows cargo pockets with branded snap closures",
        "Contrasting heavy-duty tobacco stitch detailing and reinforced seat",
        "Relaxed wide straight-leg profile with clean ankle drape",
        "Custom antiqued brass rivet and button fly closure"
      ],
      set_id: "dreamer",
    },
    {
      id: "stwd-outfit",
      name: "STWD Quarter-Zip & Cargo Denim Suite",
      category: "Outfits",
      price: 38000,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/stwd-outfit.png",
        "/images/products/stwd-outfit.png",
      ],
      description:
        "Two-piece street-engineered outfit combining the obsidian STWD quarter-zip polo shirt with relaxed wide-leg cargo denim.",
      specs: [
        "Includes both the STWD Quarter-Zip Polo and Wide-Leg Cargo Denim",
        "Heavyweight 300 GSM sun-washed cotton paired with 13.5oz vintage washed indigo denim",
        "Dual cargo bellows utility pockets with antiqued metal snap closures",
        "Certified numbered studio archive suite (1 of 100)",
        "Delivered in signature FlipMeet Studio matte black presentation box",
      ],
      set_id: "stwd",
    },
    {
      id: "stwd-shirt",
      name: "STWD Vintage Quarter-Zip Polo",
      category: "Shirts",
      price: 23500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/stwd-shirt.png",
        "/images/products/stwd-shirt.png",
      ],
      description:
        "Washed obsidian heavyweight cotton polo featuring custom silver quarter-zip hardware and high-density white STWD script embroidery at the chest.",
      specs: [
        "Heavyweight 300 GSM vintage sun-washed combed cotton",
        "Signature white STWD script embroidery on left chest",
        "High-shine custom silver quarter-zip placket with branded puller",
        "Relaxed boxy streetwear silhouette with classic polo collar",
        "Individually numbered studio archive piece (1 of 100)",
      ],
      set_id: "stwd",
    },
    {
      id: "core-black-trousers",
      name: "Core Black Technical Trousers",
      category: "Trousers",
      price: 18500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/core-black-trousers.png",
        "/images/products/core-black-trousers.png",
      ],
      description: "Wide-leg relaxed technical trousers in deep black, featuring front pin-tuck creases and premium encased drawstring waist.",
      specs: ["Heavyweight interlock jersey cotton blend", "Permanent front pintuck center crease", "Encased elastic waistband with tonal metal-tipped drawcords", "Deep slash side pockets", "Wide-leg fluid drape"]
    },
    {
      id: "vintage-dark-indigo-denim",
      name: "Vintage Dark Indigo Flared Denim",
      category: "Pants",
      price: 21500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/vintage-dark-indigo-denim.png",
        "/images/products/vintage-dark-indigo-denim.png",
      ],
      description: "Retro-inspired flared denim cut from premium dark indigo washed cotton, featuring raw frayed hems and vintage fading.",
      specs: ["14oz premium ring-spun dark indigo denim", "Flared bell-bottom silhouette with raw frayed hem", "Custom antiqued metal hardware and rivet details", "Subtle whiskering and vintage fade wash", "Classic 5-pocket styling"]
    },
    {
      id: "vintage-light-wash-denim",
      name: "Vintage Light Wash Flared Denim",
      category: "Pants",
      price: 21500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/vintage-light-wash-denim.png",
        "/images/products/vintage-light-wash-denim.png",
      ],
      description: "Iconic flared denim pants in a nostalgic light vintage wash, perfectly tailored with an architectural wide leg and subtle fading.",
      specs: ["13.5oz vintage light wash premium denim", "Flared silhouette for seamless footwear stacking", "Antiqued silver-tone button fly and hardware", "Hand-finished fading down the center leg", "Classic 5-pocket utility construction"]
    },
    {
      id: "core-black-utility-shirt",
      name: "Core Black Utility Shirt",
      category: "Shirts",
      price: 16500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/core-black-utility-shirt.png",
        "/images/products/core-black-utility-shirt.png",
      ],
      description: "A minimalist black short-sleeve utility shirt featuring dual chest flap pockets and a relaxed camp collar silhouette.",
      specs: ["Lightweight textured cotton blend", "Relaxed camp collar design", "Dual chest bellows pockets with button closures", "Tonal matte button hardware", "Straight hem for versatile layering"]
    },
    {
      id: "raggiante-91-polo",
      name: "Raggiante 91 Sports Union Polo",
      category: "Shirts",
      price: 19500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/raggiante-91-polo.png",
        "/images/products/raggiante-91-polo.png",
      ],
      description: "Vintage-inspired navy quarter-zip polo featuring contrast grey collar and retro Sports Union 91 Raggiante graphic prints.",
      specs: ["Midweight breathable cotton pique", "Contrast heather grey rib-knit polo collar", "Silver-tone quarter-zip placket hardware", "High-density retro athletic graphic prints", "Relaxed boxy fit with drop shoulders"]
    },
    {
      id: "cream-textured-camp-shirt",
      name: "Cream Textured Camp Collar Shirt",
      category: "Shirts",
      price: 18500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/cream-textured-camp-shirt.png",
        "/images/products/cream-textured-camp-shirt.png",
      ],
      description: "An elegant cream short-sleeve shirt crafted from a premium custom textured jacquard fabric, finished with contrast black buttons.",
      specs: ["Premium cotton blend with custom geometric jacquard texture", "Classic open camp collar", "Contrast glossy black button closures", "Relaxed drape and breathable weave", "Clean straight hem construction"]
    },
    {
      id: "dtsiinctlve-navy-shirt",
      name: "Dtsiinctlve Shirt (Navy)",
      category: "Shirts",
      price: 15500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dtsiinctlve-navy-shirt.png",
        "/images/products/dtsiinctlve-navy-shirt.png",
      ],
      description: "Premium heavyweight navy t-shirt featuring the signature DTSIINCTLVE STYLE chest graphic in a sleek minimalist design.",
      specs: ["Heavyweight 280 GSM premium cotton", "High-density chest graphic print", "Classic ribbed crewneck collar", "Relaxed boxy silhouette", "Pre-shrunk for lasting fit"],
      set_id: "dtsiinctlve"
    },
    {
      id: "dtsiinctlve-olive-shirt",
      name: "Dtsiinctlve Shirt (Olive)",
      category: "Shirts",
      price: 15500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dtsiinctlve-olive-shirt.png",
        "/images/products/dtsiinctlve-olive-shirt.png",
      ],
      description: "Premium heavyweight olive green t-shirt featuring the signature DTSIINCTLVE STYLE chest graphic in a sleek minimalist design.",
      specs: ["Heavyweight 280 GSM premium cotton", "High-density chest graphic print", "Classic ribbed crewneck collar", "Relaxed boxy silhouette", "Pre-shrunk for lasting fit"],
      set_id: "dtsiinctlve"
    },
    {
      id: "dtsiinctlve-white-shirt",
      name: "Dtsiinctlve Shirt (White)",
      category: "Shirts",
      price: 15500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dtsiinctlve-white-shirt.png",
        "/images/products/dtsiinctlve-white-shirt.png",
      ],
      description: "Premium heavyweight white t-shirt featuring the signature DTSIINCTLVE STYLE chest graphic in a sleek minimalist design.",
      specs: ["Heavyweight 280 GSM premium cotton", "High-density chest graphic print", "Classic ribbed crewneck collar", "Relaxed boxy silhouette", "Pre-shrunk for lasting fit"],
      set_id: "dtsiinctlve"
    },
    {
      id: "stwd-shirt-cream",
      name: "STWD Vintage Quarter-Zip Polo (Cream)",
      category: "Shirts",
      price: 23500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/stwd-shirt-cream.png",
        "/images/products/stwd-shirt-cream.png",
      ],
      description: "Light cream heavyweight cotton polo featuring custom silver quarter-zip hardware and high-density black STWD script embroidery at the chest.",
      specs: ["Heavyweight 300 GSM vintage sun-washed combed cotton", "Signature black STWD script embroidery on left chest", "High-shine custom silver quarter-zip placket with branded puller", "Relaxed boxy streetwear silhouette with classic polo collar", "Individually numbered studio archive piece (1 of 100)"],
      set_id: "stwd"
    },
    {
      id: "stwd-shirt-charcoal",
      name: "STWD Vintage Quarter-Zip Polo (Charcoal)",
      category: "Shirts",
      price: 23500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/stwd-shirt-charcoal.png?v=fixed2",
        "/images/products/stwd-shirt-charcoal.png",
      ],
      description: "Dark charcoal heavyweight heathered polo featuring custom silver quarter-zip hardware and tonal high-density STWD script embroidery.",
      specs: ["Heavyweight 300 GSM vintage sun-washed combed cotton", "Tonal black STWD script embroidery on left chest", "High-shine custom silver quarter-zip placket with branded puller", "Relaxed boxy streetwear silhouette with classic polo collar", "Individually numbered studio archive piece (1 of 100)"],
      set_id: "stwd"
    },
    {
      id: "stwd-shirt-grey",
      name: "STWD Vintage Quarter-Zip Polo (Heather Grey)",
      category: "Shirts",
      price: 23500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/stwd-shirt-grey.png",
        "/images/products/stwd-shirt-grey.png",
      ],
      description: "Heather grey heavyweight cotton polo featuring custom silver quarter-zip hardware and high-density black STWD script embroidery at the chest.",
      specs: ["Heavyweight 300 GSM vintage sun-washed combed cotton", "Signature black STWD script embroidery on left chest", "High-shine custom silver quarter-zip placket with branded puller", "Relaxed boxy streetwear silhouette with classic polo collar", "Individually numbered studio archive piece (1 of 100)"],
      set_id: "stwd"
    },
    {
      id: "anime-op-flame-outfit",
      name: "One Piece Flame Outfit",
      category: "Outfits",
      price: 28500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-op-flame-outfit.png",
        "/images/products/anime-op-flame-outfit.png",
      ],
      description: "Premium anime archive look featuring custom One Piece flame collar jersey and matching wide-leg trousers.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated flame graphics", "Wide-leg relaxed fit track pants", "Embroidered Jolly Roger chest detail", "Limited archive piece (1 of 100)"],
      set_id: "anime-op-flame"
    },
    {
      id: "anime-op-flame-jersey",
      name: "One Piece Flame Jersey",
      category: "Jerseys",
      price: 16500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-op-flame-jersey.png",
        "/images/products/anime-op-flame-jersey.png",
      ],
      description: "Premium black jersey featuring custom sublimated pink flame graphics and One Piece Jolly Roger detail.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated flame graphics on collar and hem", "Embroidered Jolly Roger chest detail", "Relaxed oversized fit", "Limited archive piece (1 of 100)"],
      set_id: "anime-op-flame"
    },
    {
      id: "anime-gojo-outfit",
      name: "Jujutsu Kaisen Gojo Outfit",
      category: "Outfits",
      price: 28500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-gojo-outfit.png",
        "/images/products/anime-gojo-outfit.png",
      ],
      description: "Premium anime archive look featuring custom Jujutsu Kaisen Gojo jersey and matching multi-pocket cargo pants.",
      specs: ["Premium moisture-wicking jersey material", "High-density Gojo manga panel sublimation", "Heavyweight tactical cargo pants", "V-neck sportswear collar", "Limited archive piece (1 of 100)"],
      set_id: "anime-gojo"
    },
    {
      id: "anime-gojo-jersey",
      name: "Jujutsu Kaisen Gojo Jersey",
      category: "Jerseys",
      price: 16500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-gojo-jersey.png",
        "/images/products/anime-gojo-jersey.png",
      ],
      description: "Premium purple v-neck jersey featuring high-contrast Gojo Satoru manga panels and Jujutsu Kaisen typography.",
      specs: ["Premium moisture-wicking jersey material", "High-density Gojo manga panel sublimation", "V-neck sportswear collar with contrast taping", "Relaxed oversized fit", "Limited archive piece (1 of 100)"],
      set_id: "anime-gojo"
    },
    {
      id: "anime-luffy-blue-outfit",
      name: "One Piece Luffy Blue Flame Outfit",
      category: "Outfits",
      price: 28500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-luffy-blue-outfit.png",
        "/images/products/anime-luffy-blue-outfit.png",
      ],
      description: "Premium anime archive look featuring custom One Piece Luffy blue flame v-neck jersey and matching light blue denim cargos.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated blue flame graphics", "Light wash relaxed denim cargo pants", "Embroidered Jolly Roger chest detail", "Limited archive piece (1 of 100)"],
      set_id: "anime-luffy-blue"
    },
    {
      id: "anime-luffy-blue-jersey",
      name: "One Piece Luffy Blue Flame Jersey",
      category: "Jerseys",
      price: 16500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-luffy-blue-jersey.png",
        "/images/products/anime-luffy-blue-jersey.png",
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-luffy-blue-jersey-back.png",
        "/images/products/anime-luffy-blue-jersey-back.png"
      ],
      description: "Premium white jersey featuring custom sublimated blue flame graphics and One Piece Jolly Roger detail.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated blue flame graphics on collar and hem", "Embroidered Jolly Roger chest detail", "Relaxed oversized fit", "Limited archive piece (1 of 100)"],
      set_id: "anime-luffy-blue"
    },
    {
      id: "anime-robin-purple-outfit",
      name: "One Piece Robin Purple Outfit",
      category: "Outfits",
      price: 28500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-robin-purple-outfit.png",
        "/images/products/anime-robin-purple-outfit.png",
      ],
      description: "Premium anime archive look featuring custom Nico Robin purple jersey and matching white wide-leg trousers.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated Robin graphics", "White wide-leg relaxed fit pants", "Embroidered Jolly Roger chest detail", "Limited archive piece (1 of 100)"],
      set_id: "anime-robin-purple"
    },
    {
      id: "anime-robin-purple-jersey",
      name: "One Piece Robin Purple Jersey",
      category: "Jerseys",
      price: 16500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-robin-purple-jersey.png",
        "/images/products/anime-robin-purple-jersey.png"
      ],
      description: "Premium purple and white striped jersey featuring Nico Robin graphic and One Piece Jolly Roger detail.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated Robin graphics", "Embroidered Jolly Roger chest detail", "Relaxed oversized fit", "Limited archive piece (1 of 100)"],
      set_id: "anime-robin-purple"
    },
    {
      id: "anime-zoro-green-outfit",
      name: "One Piece Zoro Green Outfit",
      category: "Outfits",
      price: 28500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-zoro-green-outfit.png",
        "/images/products/anime-zoro-green-outfit.png",
      ],
      description: "Premium anime archive look featuring custom Roronoa Zoro green jersey and matching dark green wide-leg track pants.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated Zoro graphics", "Dark green wide-leg relaxed fit track pants", "Embroidered Jolly Roger sleeve detail", "Limited archive piece (1 of 100)"],
      set_id: "anime-zoro-green"
    },
    {
      id: "anime-zoro-green-jersey",
      name: "One Piece Zoro Green Jersey",
      category: "Jerseys",
      price: 16500,
      sizes: ["S", "M", "L", "XL"],
      stock: 100,
      images: [
        "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-zoro-green-jersey.png",
        "/images/products/anime-zoro-green-jersey.png"
      ],
      description: "Premium dark green jersey featuring custom Zoro sleeve graphics and classic 03 numbering.",
      specs: ["Premium moisture-wicking jersey material", "Custom sublimated Zoro graphics on sleeves", "Classic 03 numbering", "Relaxed oversized fit", "Limited archive piece (1 of 100)"],
      set_id: "anime-zoro-green"
    }
  ];

  return newProducts;
}

