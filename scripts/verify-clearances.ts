import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PRODUCT_WALL_MAP, type WallType } from "@/lib/brick-card-config";

interface FrameSpec {
  W: number;
  H: number;
  slot: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  floor: number;
}

export const FRAMES: Record<WallType, FrameSpec> = {
  outfit: {
    W: 700,
    H: 1080,
    slot: { left: 26.4, top: 27.8, width: 47.1, height: 55.6 },
    floor: 83.4,
  },
  pants: {
    W: 680,
    H: 940,
    slot: { left: 26.7, top: 29.0, width: 46.5, height: 55.0 },
    floor: 84.0,
  },
  jersey: {
    W: 800,
    H: 800,
    slot: { left: 26.0, top: 27.5, width: 48.0, height: 50.6 },
    floor: 78.1,
  },
};

interface MaskHole {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  holePixels: number;
}

export async function measureErodedMasks(): Promise<Record<string, MaskHole>> {
  const maskKeys = [
    "outfit-a",
    "outfit-b",
    "pants-a",
    "pants-b",
    "jersey-a",
    "jersey-b",
  ];
  const erodedMasks: Record<string, MaskHole> = {};

  for (const key of maskKeys) {
    const filePath = path.join(process.cwd(), "public", "brick-frames", `${key}-mask.png`);
    const { data, info } = await sharp(filePath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const radius = 10;
    let erMinX = width;
    let erMaxX = 0;
    let erMinY = height;
    let erMaxY = 0;
    let erHolePixels = 0;

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const a = data[(y * width + x) * channels + 3];
        if (a > 128) {
          if (
            data[((y - radius) * width + x) * channels + 3] > 128 &&
            data[((y + radius) * width + x) * channels + 3] > 128 &&
            data[(y * width + (x - radius)) * channels + 3] > 128 &&
            data[(y * width + (x + radius)) * channels + 3] > 128
          ) {
            erHolePixels++;
            if (x < erMinX) erMinX = x;
            if (x > erMaxX) erMaxX = x;
            if (y < erMinY) erMinY = y;
            if (y > erMaxY) erMaxY = erMaxY;
            if (y > erMaxY) erMaxY = y;
          }
        }
      }
    }

    erodedMasks[key] = {
      minX: erMinX,
      maxX: erMaxX,
      minY: erMinY,
      maxY: erMaxY,
      width: erMaxX - erMinX + 1,
      height: erMaxY - erMinY + 1,
      holePixels: erHolePixels,
    };
  }

  return erodedMasks;
}

async function run() {
  console.log("Loading product bounds and measuring frame clearances...");
  const boundsPath = path.join(process.cwd(), "lib", "product-bounds.json");
  const bounds = JSON.parse(fs.readFileSync(boundsPath, "utf-8"));
  const erodedMasks = await measureErodedMasks();

  const stats: Record<
    WallType,
    { sides: number[]; top: number[]; bottom: number[]; area: number[] }
  > = {
    outfit: { sides: [], top: [], bottom: [], area: [] },
    pants: { sides: [], top: [], bottom: [], area: [] },
    jersey: { sides: [], top: [], bottom: [], area: [] },
  };

  const failures: any[] = [];
  let totalEvaluations = 0;

  for (const [id, entry] of Object.entries<any>(bounds)) {
    const wallType: WallType = PRODUCT_WALL_MAP[id] || "outfit";
    const frame = FRAMES[wallType];
    const slot = frame.slot;

    const slotW = (slot.width / 100) * frame.W;
    const slotH = (slot.height / 100) * frame.H;
    const slotAR = slotW / slotH;
    const visAR = entry.visibleAspect;

    let visW: number;
    let visH: number;
    if (visAR <= slotAR) {
      visH = slotH;
      visW = slotH * visAR;
    } else {
      visW = slotW;
      visH = slotW / visAR;
    }

    const visX = (slot.left / 100) * frame.W + (slotW - visW) / 2;
    const visY = (slot.top / 100) * frame.H + (slotH - visH);
    const visBottom = visY + visH;

    for (const variant of ["a", "b"]) {
      const mask = erodedMasks[`${wallType}-${variant}`];

      for (const flipped of [false, true]) {
        totalEvaluations++;
        const maskMinX = flipped ? frame.W - 1 - mask.maxX : mask.minX;
        const maskMaxX = flipped ? frame.W - 1 - mask.minX : mask.maxX;
        const maskWidth = mask.width;
        const maskHeight = mask.height;

        // Normal state
        const leftClearancePct = ((visX - maskMinX) / maskWidth) * 100;
        const rightClearancePct = ((maskMaxX - (visX + visW)) / maskWidth) * 100;
        const topClearancePct = ((visY - mask.minY) / maskHeight) * 100;
        const floorTarget = (frame.floor / 100) * frame.H;
        const bottomFloorDiffPct = (Math.abs(visBottom - floorTarget) / frame.H) * 100;
        const areaPct = ((visW * visH) / mask.holePixels) * 100;

        // Hover state (translateY -3%, scale 1.035 from bottom-center)
        const hoverScale = 1.035;
        const hoverLift = 0.03 * slotH;
        const hVisW = visW * hoverScale;
        const hVisH = visH * hoverScale;
        const hVisX = visX - (hVisW - visW) / 2;
        const hVisY = visY - hoverLift - (hVisH - visH);

        const hLeftClearancePct = ((hVisX - maskMinX) / maskWidth) * 100;
        const hRightClearancePct = ((maskMaxX - (hVisX + hVisW)) / maskWidth) * 100;
        const hTopClearancePct = ((hVisY - mask.minY) / maskHeight) * 100;

        stats[wallType].sides.push(leftClearancePct, rightClearancePct);
        stats[wallType].top.push(topClearancePct);
        stats[wallType].bottom.push(bottomFloorDiffPct);
        stats[wallType].area.push(areaPct);

        const minSide = Math.min(leftClearancePct, rightClearancePct);
        const hMinSide = Math.min(hLeftClearancePct, hRightClearancePct);

        if (minSide < 14 || hMinSide < 14) {
          failures.push({
            id,
            wallType,
            variant,
            flipped,
            issue: "Side clearance < 14%",
            normalSide: minSide.toFixed(2),
            hoverSide: hMinSide.toFixed(2),
          });
        }
        if (topClearancePct < 12 || hTopClearancePct < 12) {
          failures.push({
            id,
            wallType,
            variant,
            flipped,
            issue: "Top clearance < 12%",
            normalTop: topClearancePct.toFixed(2),
            hoverTop: hTopClearancePct.toFixed(2),
          });
        }
        if (bottomFloorDiffPct > 2) {
          failures.push({
            id,
            wallType,
            variant,
            flipped,
            issue: "Bottom floor diff > 2%",
            diff: bottomFloorDiffPct.toFixed(2),
          });
        }
      }
    }
  }

  console.log(`\nEvaluated ${totalEvaluations} configurations across 44 products.`);
  console.log(`Total clearance failures: ${failures.length}`);

  if (failures.length > 0) {
    console.error("FAILURES DETECTED:", JSON.stringify(failures, null, 2));
    process.exit(1);
  } else {
    console.log("✓ ALL 44 PRODUCTS PASSED ALL CLEARANCE CRITERIA (Normal + Hover, Variant A/B, Flipped/Not-Flipped)!");
  }

  for (const [type, data] of Object.entries(stats)) {
    const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    const min = (arr: number[]) => Math.min(...arr).toFixed(1);
    const max = (arr: number[]) => Math.max(...arr).toFixed(1);

    console.log(`\n=== TYPE: ${type.toUpperCase()} ===`);
    console.log(`Side clearance: Min ${min(data.sides)}% | Avg ${avg(data.sides)}% | Max ${max(data.sides)}% (Target >= 14%)`);
    console.log(`Top clearance:  Min ${min(data.top)}% | Avg ${avg(data.top)}% | Max ${max(data.top)}% (Target >= 12%)`);
    console.log(`Floor diff:     Max ${max(data.bottom)}% | Avg ${avg(data.bottom)}% (Target <= 2%)`);
    console.log(`Area / Hole:    Min ${min(data.area)}% | Avg ${avg(data.area)}% | Max ${max(data.area)}% (Target ~55-70%)`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
