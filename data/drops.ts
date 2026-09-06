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

// Placeholder content mirroring the reference: "DROP 001 - Four Outfits. One First Chapter."
export const drops: Drop[] = [
  {
    id: "drop-001",
    name: "DROP 001",
    tagline: "Four Outfits. One First Chapter.",
    preOrderCloses: "2026-10-01T00:00:00.000Z",
    deliveryWindow: { start: "2026-10-20", end: "2026-10-30" },
    looks: [
      {
        id: "look-01",
        slug: "look-01",
        name: "Look 01",
        description: "Jersey + Baggy Denim",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: [],
      },
      {
        id: "look-02",
        slug: "look-02",
        name: "Look 02",
        description: "Oversized Top + Wide Trousers",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: [],
      },
      {
        id: "look-03",
        slug: "look-03",
        name: "Look 03",
        description: "Heavy Jersey + Cargo",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: [],
      },
      {
        id: "look-04",
        slug: "look-04",
        name: "Look 04",
        description: "Statement Top + Baggy Denim",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: [],
      },
    ],
  },
];
