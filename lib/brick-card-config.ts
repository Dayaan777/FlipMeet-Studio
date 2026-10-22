import productBoundsData from "./product-bounds.json";

export type WallType = "outfit" | "pants" | "jersey";

export interface FrameSpec {
  W: number;
  H: number;
  ratio: string;
  slot: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  floor: number;
}

/**
 * Tuned slot specs satisfying >=14% side clearance, >=12% top clearance,
 * and <=2% floor diff across all 44 products in normal and hover states.
 */
export const FRAMES: Record<WallType, FrameSpec> = {
  outfit: {
    W: 700,
    H: 1080,
    ratio: "700 / 1080",
    slot: { left: 26.4, top: 27.8, width: 47.1, height: 55.6 },
    floor: 83.4,
  },
  pants: {
    W: 680,
    H: 940,
    ratio: "680 / 940",
    slot: { left: 26.7, top: 29.0, width: 46.5, height: 55.0 },
    floor: 84.0,
  },
  jersey: {
    W: 800,
    H: 800,
    ratio: "800 / 800",
    slot: { left: 26.0, top: 27.5, width: 48.0, height: 50.6 },
    floor: 78.1,
  },
};

/**
 * Series / set_id to accent glow color mapping.
 * Fallbacks to neutral warm copper (#c27847) if unknown.
 */
export const SET_ACCENTS: Record<string, string> = {
  "anime-gojo": "#8a46ff", // Gojo Hollow Purple
  "anime-luffy-blue": "#2da0ff", // Luffy Blue Flame
  "anime-op-flame": "#f43f5e", // Ace Pink/Crimson Flame
  "anime-robin-purple": "#a855f7", // Nico Robin Purple
  "anime-zoro-green": "#22c55e", // Zoro Green
  dreamer: "#f59e0b", // Gold / Amber
  stwd: "#a855f7", // STWD Regal Violet
  "limited-edition-1996-green": "#16a34a", // Forest Green
  "limited-edition-1996-red": "#dc2626", // Archival Red
  "saint-culture": "#ea580c", // Copper / Orange
  "light-blue": "#38bdf8", // Sky Blue
};

export const DEFAULT_ACCENT = "#c27847"; // Warm copper/terracotta brand tone

/**
 * Explicit product -> wall type overrides.
 */
export const PRODUCT_WALL_MAP: Record<string, WallType> = {
  // Outfits (700 x 1080)
  "anime-gojo-outfit": "outfit",
  "anime-luffy-blue-outfit": "outfit",
  "anime-op-flame-outfit": "outfit",
  "anime-robin-purple-outfit": "outfit",
  "anime-zoro-green-outfit": "outfit",
  "dreamer-outfit": "outfit",
  "light-blue-outfit": "outfit",
  "limited-edition-1996-green-outfit": "outfit",
  "limited-edition-1996-red-outfit": "outfit",
  "saint-culture-outfit": "outfit",
  "stwd-outfit": "outfit",

  // Jerseys & Shirts (800 x 800)
  "anime-gojo-jersey": "jersey",
  "anime-luffy-blue-jersey": "jersey",
  "anime-op-flame-jersey": "jersey",
  "anime-robin-purple-jersey": "jersey",
  "anime-zoro-green-jersey": "jersey",
  "core-black-utility-shirt": "jersey",
  "cream-textured-camp-shirt": "jersey",
  "dreamer-jersey": "jersey",
  "dtsiinctlve-navy-shirt": "jersey",
  "dtsiinctlve-olive-shirt": "jersey",
  "dtsiinctlve-white-shirt": "jersey",
  "light-blue-shirt": "jersey",
  "limited-edition-1996-green-shirt": "jersey",
  "limited-edition-1996-red-shirt": "jersey",
  "product-44": "jersey",
  "product-45": "jersey",
  "raggiante-91-polo": "jersey",
  "saint-culture-jersey": "jersey",
  "stwd-shirt": "jersey",
  "stwd-shirt-charcoal": "jersey",
  "stwd-shirt-cream": "jersey",
  "stwd-shirt-grey": "jersey",

  // Pants & Trousers (680 x 940)
  "core-black-trousers": "pants",
  "dreamer-pants": "pants",
  "light-blue-pants": "pants",
  "limited-edition-1996-green-trouser": "pants",
  "limited-edition-1996-red-trouser": "pants",
  "product-42": "pants",
  "product-43": "pants",
  "product-46": "pants",
  "saint-culture-trouser": "pants",
  "vintage-dark-indigo-denim": "pants",
  "vintage-light-wash-denim": "pants",
};

/**
 * Future-proof wall type derivation:
 * 1. Checks explicit overrides in PRODUCT_WALL_MAP.
 * 2. Ignores the generic tag "All".
 * 3. Matches real category words:
 *    - Outfits -> outfit
 *    - Shirts, Jerseys -> jersey
 *    - Pants, Trousers -> pants
 * 4. If several real categories disagree, logs a warning and uses fallback.
 */
export function getProductWallType(id: string, rawCategory: string = ""): WallType {
  if (PRODUCT_WALL_MAP[id]) {
    return PRODUCT_WALL_MAP[id];
  }

  // Tokenize category string, ignoring "All"
  const tokens = rawCategory
    .split(/[,/|]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t !== "all");

  const matchingTypes = new Set<WallType>();

  for (const token of tokens) {
    if (token.includes("outfit")) {
      matchingTypes.add("outfit");
    } else if (
      token.includes("pant") ||
      token.includes("trouser") ||
      token.includes("denim") ||
      token.includes("jean") ||
      token.includes("sweatpant")
    ) {
      matchingTypes.add("pants");
    } else if (
      token.includes("jersey") ||
      token.includes("shirt") ||
      token.includes("polo") ||
      token.includes("top") ||
      token.includes("tee")
    ) {
      matchingTypes.add("jersey");
    }
  }

  if (matchingTypes.size === 1) {
    return Array.from(matchingTypes)[0];
  }

  if (matchingTypes.size > 1) {
    console.warn(
      `[BrickCard] Product "${id}" has ambiguous categories "${rawCategory}" resolving to [${Array.from(
        matchingTypes
      ).join(", ")}]. Defaulting to outfit.`
    );
    return "outfit";
  }

  return "outfit";
}

/**
 * Returns accent color based on series/set_id or default.
 */
export function getProductAccent(setId?: string | null): string {
  if (setId && SET_ACCENTS[setId]) {
    return SET_ACCENTS[setId];
  }
  return DEFAULT_ACCENT;
}

/**
 * Stable hash function for SSR-safe variant selection.
 * Generates deterministic number from product id/slug.
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function getProductVariant(id: string): { variant: "a" | "b"; isFlipped: boolean } {
  const hash = hashString(id);
  const variant: "a" | "b" = hash % 2 === 0 ? "a" : "b";
  const isFlipped = Math.floor(hash / 2) % 2 === 1;
  return { variant, isFlipped };
}

export interface ProductBoundsEntry {
  id: string;
  imageWidth: number;
  imageHeight: number;
  insets: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  visibleBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
  visibleAspect: number;
}

const boundsMap = productBoundsData as Record<string, ProductBoundsEntry>;

export function getProductBounds(id: string): ProductBoundsEntry | undefined {
  return boundsMap[id];
}

/**
 * Computes exact CSS position & dimensions so the visible garment
 * lands firmly on the floor line with contain-fit, compensating
 * for transparent padding in the cutout without modifying the image.
 */
export function getProductImageStyle(
  id: string,
  wallType: WallType
): React.CSSProperties {
  const bounds = getProductBounds(id);
  if (!bounds) {
    return {
      position: "absolute",
      inset: 0,
    };
  }

  const frame = FRAMES[wallType];
  const slotW = (frame.slot.width / 100) * frame.W;
  const slotH = (frame.slot.height / 100) * frame.H;
  const slotAR = slotW / slotH;
  const visAR = bounds.visibleAspect;

  const L = bounds.insets.left;
  const R = bounds.insets.right;
  const T = bounds.insets.top;
  const B = bounds.insets.bottom;

  const Vw = (100 - L - R) / 100;
  const Vh = (100 - T - B) / 100;

  let Wv: number;
  let Hv: number;
  let Xv: number;
  let Yv: number;

  if (visAR <= slotAR) {
    Hv = 100;
    Wv = 100 * (visAR / slotAR);
    Xv = (100 - Wv) / 2;
    Yv = 0;
  } else {
    Wv = 100;
    Hv = 100 * (slotAR / visAR);
    Xv = 0;
    Yv = 100 - Hv;
  }

  const imgW = Wv / Vw;
  const imgH = Hv / Vh;
  const imgL = Xv - imgW * (L / 100);
  const imgT = Yv - imgH * (T / 100);

  return {
    position: "absolute",
    width: `${imgW.toFixed(2)}%`,
    height: `${imgH.toFixed(2)}%`,
    left: `${imgL.toFixed(2)}%`,
    top: `${imgT.toFixed(2)}%`,
  };
}
