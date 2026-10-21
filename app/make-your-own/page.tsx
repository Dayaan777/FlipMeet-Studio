import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/products";
import OutfitBuilder from "./OutfitBuilder";
import HomeWallBackground from "@/components/HomeWallBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Make Your Outfit | HT x Studio",
  description:
    "Build your perfect look. Mix and match tops and bottoms from the HT x Studio archive.",
};

export default async function MakeYourOwnPage() {
  const allProducts = await getProducts();
  const tops = allProducts.filter(
    (p) => (p.category && (p.category.includes("Shirts") || p.category.includes("Jerseys")))
  );
  const bottoms = allProducts.filter(
    (p) => (p.category && (p.category.includes("Pants") || p.category.includes("Trousers")))
  );

  return (
    <>
      <NavBar mobileSolid />
      <main className="home-wall min-h-screen pt-[73px]">
        <HomeWallBackground />
        <div className="relative z-10">
        <OutfitBuilder tops={tops} bottoms={bottoms} />
      </div>
      </main>
      <Footer />
    </>
  );
}
