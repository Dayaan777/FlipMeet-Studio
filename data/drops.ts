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

// Drop 001 look data and saved campaign assets.
export const drops: Drop[] = [
  {
    id: "drop-001",
    name: "DROP 001",
    tagline: "Six Outfits. One First Chapter.",
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
        images: ["/images/looks/look-01.jpg"],
      },
      {
        id: "look-02",
        slug: "look-02",
        name: "Look 02",
        description: "Green Tee + Baggy Denim",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: ["/images/looks/look-02.jpg"],
      },
      {
        id: "look-03",
        slug: "look-03",
        name: "Look 03",
        description: "Rust Hoodie + Denim",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: ["/images/looks/look-03.jpg"],
      },
      {
        id: "look-04",
        slug: "look-04",
        name: "Look 04",
        description: "Cream Tee + Light Denim",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: ["/images/looks/look-04.jpg"],
      },
      {
        id: "look-05",
        slug: "look-05",
        name: "Look 05",
        description: "Black Jersey + Cargo",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: ["/images/looks/look-05.jpg"],
      },
      {
        id: "look-06",
        slug: "look-06",
        name: "Look 06",
        description: "Cream Jersey + Black Denim",
        price: 0,
        sizes: ["S", "M", "L", "XL"],
        images: ["/images/looks/look-06.jpg"],
      },
    ],
  },
];
