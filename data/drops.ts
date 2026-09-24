export type Look = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  images: string[];
};

export type Drop = {
  id: string;
  name: string;
  tagline: string;
  preOrderCloses: string; // ISO date
  deliveryWindow: { start: string; end: string };
  looks: Look[];
};

// Official FlipMeet Studio drops & collection archive
export const drops: Drop[] = [
  {
    id: "drop-001",
    name: "DROP 001",
    tagline: "Exclusive Bespoke Streetwear Suites & Coordinates.",
    preOrderCloses: "2026-10-01T00:00:00.000Z",
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
    looks: [
      {
        id: "limited-edition-1996-red-outfit",
        slug: "limited-edition-1996-red-outfit",
        name: "Limited Edition 1996 Red Suit",
        description: "Two-piece quarter-zip polo and corduroy trousers",
        price: 39000,
        sizes: ["S", "M", "L", "XL"],
        images: [
          "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-red-outfit.png",
          "/images/products/limited-edition-1996-red-outfit.png",
        ],
      },
      {
        id: "dreamer-outfit",
        slug: "dreamer-outfit",
        name: "Dreamer 84 Heavyweight Suite",
        description: "Two-piece mesh v-neck jersey and cargo denim",
        price: 39000,
        sizes: ["S", "M", "L", "XL"],
        images: [
          "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-outfit.png?v=1",
          "/images/products/dreamer-outfit.png",
        ],
      },
      {
        id: "stwd-outfit",
        slug: "stwd-outfit",
        name: "STWD Quarter-Zip & Cargo Suite",
        description: "Two-piece obsidian polo and cargo denim suite",
        price: 38000,
        sizes: ["S", "M", "L", "XL"],
        images: [
          "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/stwd-outfit.png",
          "/images/products/stwd-outfit.png",
        ],
      },
      {
        id: "limited-edition-1996-green-outfit",
        slug: "limited-edition-1996-green-outfit",
        name: "Limited Edition 1996 Green Suit",
        description: "Two-piece forest green polo and corduroy trousers",
        price: 39000,
        sizes: ["S", "M", "L", "XL"],
        images: [
          "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-green-outfit.png",
          "/images/products/limited-edition-1996-green-outfit.png",
        ],
      },
      {
        id: "saint-culture-outfit",
        slug: "saint-culture-outfit",
        name: "Saint Culture Heavyweight Suit",
        description: "Two-piece athletic jersey and pleated trousers",
        price: 39000,
        sizes: ["S", "M", "L", "XL"],
        images: [
          "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/saint-culture-outfit.png",
          "/images/products/saint-culture-outfit.png",
        ],
      },
      {
        id: "light-blue-outfit",
        slug: "light-blue-outfit",
        name: "Light Blue Archival Suite",
        description: "Two-piece colorblocked shirt and wide-leg denim",
        price: 39000,
        sizes: ["S", "M", "L", "XL"],
        images: [
          "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/light-blue-outfit.png",
          "/images/products/light-blue-outfit.png",
        ],
      },
    ],
  },
];
