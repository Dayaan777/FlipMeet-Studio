import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { getProductById, getProducts, getProductsBySetId } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

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
    return { title: "Product Not Found | HT x Studio" };
  }

  return {
    title: `${product.name} ${product.description} | HT x Studio`,
    description: `Order ${product.name} from HT x Studio. Limited edition archive.`,
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

  let pieces = product.set_id
    ? await getProductsBySetId(product.set_id, product.id)
    : [];

  const allProducts = await getProducts();

  // If pieces array is empty, provide complementary pieces from catalog
  if (!pieces || pieces.length === 0) {
    pieces = allProducts
      .filter((p) => p.id !== product.id && !p.is_bundle)
      .slice(0, 3);
  }

  const variants = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.name.split(" (")[0] === product.name.split(" (")[0] &&
      (!p.category || !product.category || p.category.split(",").some((c) => product.category.includes(c.trim())))
  );

  return (
    <>
      <NavBar />
      <ProductDetailClient product={product} pieces={pieces} variants={variants} />
      <Footer />
    </>
  );
}
