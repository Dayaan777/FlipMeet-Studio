import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Supabase credentials matching project environment
const SUPABASE_URL = "https://gqazaajfycutqildyrqw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXphYWpmeWN1dHFpbGR5cnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTEzNzAsImV4cCI6MjEwNDcyNzM3MH0.9SnZ_D9L9duzG0bOUEPkKnWu065z4eWuUeK17i5eK5M";

export interface ProductBoundsEntry {
  id: string;
  imageWidth: number;
  imageHeight: number;
  insets: {
    left: number; // % of original image width
    right: number; // % of original image width
    top: number; // % of original image height
    bottom: number; // % of original image height
  };
  visibleBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
  visibleAspect: number; // visible width / visible height
}

async function main() {
  console.log("Measuring product visible bounding boxes (READ-ONLY, no images modified)...");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, images")
    .neq("category", "SYSTEM")
    .neq("is_bundle", true)
    .order("id");

  if (error || !products) {
    console.error("Failed to fetch products from Supabase:", error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products to measure.`);
  const boundsMap: Record<string, ProductBoundsEntry> = {};

  for (const product of products) {
    const imgUrl = product.images?.[0];
    if (!imgUrl) {
      console.warn(`[WARN] Product ${product.id} has no image!`);
      continue;
    }

    try {
      let buffer: Buffer;
      if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
        const response = await fetch(imgUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} fetching ${imgUrl}`);
        }
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        const localPath = path.join(process.cwd(), "public", imgUrl.replace(/^\//, ""));
        buffer = fs.readFileSync(localPath);
      }

      const { data, info } = await sharp(buffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { width, height, channels } = info;
      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * channels;
          const alpha = channels === 4 ? data[idx + 3] : 255;
          if (alpha > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (minX > maxX || minY > maxY) {
        console.warn(`[WARN] ${product.id} has no visible pixels > alpha 10!`);
        continue;
      }

      const visWidth = maxX - minX + 1;
      const visHeight = maxY - minY + 1;

      boundsMap[product.id] = {
        id: product.id,
        imageWidth: width,
        imageHeight: height,
        insets: {
          left: Number(((minX / width) * 100).toFixed(2)),
          right: Number((((width - 1 - maxX) / width) * 100).toFixed(2)),
          top: Number(((minY / height) * 100).toFixed(2)),
          bottom: Number((((height - 1 - maxY) / height) * 100).toFixed(2)),
        },
        visibleBox: {
          minX,
          maxX,
          minY,
          maxY,
          width: visWidth,
          height: visHeight,
        },
        visibleAspect: Number((visWidth / visHeight).toFixed(4)),
      };

      console.log(
        `✓ ${product.id}: Insets T:${boundsMap[product.id].insets.top}% B:${boundsMap[product.id].insets.bottom}% L:${boundsMap[product.id].insets.left}% R:${boundsMap[product.id].insets.right}% (aspect: ${boundsMap[product.id].visibleAspect})`
      );
    } catch (err: any) {
      console.error(`[ERROR] Failed to measure ${product.id} (${imgUrl}):`, err.message);
    }
  }

  const outputPath = path.join(process.cwd(), "lib", "product-bounds.json");
  fs.writeFileSync(outputPath, JSON.stringify(boundsMap, null, 2), "utf-8");
  console.log(`\nSuccessfully saved bounds for ${Object.keys(boundsMap).length} products to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
