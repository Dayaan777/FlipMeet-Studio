import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getProductById, getProducts } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductById(slug);

  if (!product) {
    return { title: "Product Not Found | FlipMeet Studio" };
  }

  return {
    title: `${product.name} — ${product.description} | FlipMeet Studio`,
    description: `Pre-order ${product.name} from FlipMeet Studio Drop 001. Limited to 100 pieces.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductById(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <NavBar />
      <ProductDetailClient product={product} />
      <Footer />
    </>
  );
}
