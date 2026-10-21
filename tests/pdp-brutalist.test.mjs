import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("R1: Architectural Background & Pedestal Stage Assets & Styling", async (t) => {
  await t.test("hero stage and limestone wall assets exist on disk", () => {
    const heroStagePath = path.join(ROOT, "public", "images", "pdp-hero-stage.webp");
    const wallBgPath = path.join(ROOT, "public", "home", "wall-bg.webp");
    assert.ok(fs.existsSync(heroStagePath), "pdp-hero-stage.webp must exist");
    assert.ok(fs.existsSync(wallBgPath), "wall-bg.webp must exist");

    const heroStat = fs.statSync(heroStagePath);
    assert.ok(heroStat.size > 20000, "pdp-hero-stage.webp must have valid image size");
  });

  await t.test("globals.css defines .pdp-wall and .pdp-wall-bg with seamless multi-layer background", () => {
    const css = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf-8");
    assert.match(css, /\.pdp-wall\s*\{/, "Must define .pdp-wall");
    assert.match(css, /\.pdp-wall-bg\s*\{/, "Must define .pdp-wall-bg");
    assert.ok(css.includes("pdp-hero-stage.webp"), "Must reference pdp-hero-stage.webp");
    assert.ok(css.includes("wall-bg.webp"), "Must reference wall-bg.webp for seamless limestone continuation");
    assert.ok(css.includes("140% auto"), "Must scale appropriately on mobile viewports to prevent edge cutoffs");
  });
});

test("R2: Garment Showcase & Plinth Inset Thumbnails", async (t) => {
  const pdpClient = fs.readFileSync(
    path.join(ROOT, "app", "product", "[slug]", "ProductDetailClient.tsx"),
    "utf-8"
  );

  await t.test("outfit is grounded on stone plinth with natural contact shadow", () => {
    assert.ok(
      pdpClient.includes("blur-[4px]") && pdpClient.includes("rounded-full") && pdpClient.includes("-mt-2.5"),
      "Must render natural hem/foot contact shadow on the stone plinth surface"
    );
  });

  await t.test("recessed stone plinth front face renders interactive embedded thumbnails", () => {
    assert.ok(
      pdpClient.includes("plinth-inset-thumb"),
      "Must render recessed plinth thumbnail niches"
    );
    assert.ok(
      pdpClient.includes("setActiveImageIndex(idx)"),
      "Must allow interactive thumbnail switching"
    );
    assert.ok(
      pdpClient.includes("transition-opacity duration-300"),
      "Must support smooth crossfade transition between garment views"
    );
  });

  await t.test("embedded thumbnail styling uses warm copper atelier focus border", () => {
    const css = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf-8");
    assert.ok(
      css.includes(".plinth-inset-thumb.active"),
      "Must define active styling for plinth inset thumbnail"
    );
    assert.ok(
      css.includes("#c27847"),
      "Active thumbnail border must use warm copper atelier accent"
    );
  });

  await t.test("anime-op-flame-outfit has 3 look thumbnail assets that exist on disk", () => {
    for (let i = 1; i <= 3; i++) {
      const thumbPath = path.join(ROOT, "public", "images", "looks", `thumb-op-${i}.png`);
      assert.ok(fs.existsSync(thumbPath), `thumb-op-${i}.png must exist for embedded plinth view`);
    }
  });

  await t.test("zero-gap graceful collapse when product lacks secondary images", () => {
    assert.ok(
      pdpClient.includes("{hasSecondaryImages && ("),
      "Plinth thumbnails must be strictly guarded by hasSecondaryImages"
    );
  });
});

test("R3: Purchase Column & Atelier Interactions", async (t) => {
  const pdpClient = fs.readFileSync(
    path.join(ROOT, "app", "product", "[slug]", "ProductDetailClient.tsx"),
    "utf-8"
  );
  const css = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf-8");

  await t.test("renders Cormorant Garamond serif headings and copper price", () => {
    assert.ok(
      pdpClient.includes("font-display") && pdpClient.includes("h1"),
      "Heading must use Cormorant Garamond serif via font-display"
    );
    assert.ok(
      pdpClient.includes("text-accent") && pdpClient.includes("font-sans"),
      "Price must be rendered in warm copper atelier accent"
    );
  });

  await t.test("renders size guide trigger", () => {
    assert.ok(
      pdpClient.includes("SIZE GUIDE"),
      "Must render SIZE GUIDE trigger"
    );
    assert.ok(
      pdpClient.includes("setShowDesktopSizeGuide") && pdpClient.includes("setShowMobileSizeGuide"),
      "Must toggle size guide modal/accordion"
    );
  });

  await t.test("renders dual tactile sizing pills (Top Size & Waist Size)", () => {
    assert.ok(pdpClient.includes("SELECT SIZE"), "Must render SELECT SIZE heading");
    assert.ok(pdpClient.includes("Oversized Boxy Fit"), "Must render fit indicator in copper font");
    assert.ok(pdpClient.includes("SELECT WAIST SIZE"), "Must render SELECT WAIST SIZE heading for outfits");
    assert.ok(
      pdpClient.includes("pill-tactile-active") && pdpClient.includes("pill-tactile-inactive"),
      "Must use tactile pill classes for size selectors"
    );
    assert.ok(
      css.includes(".pill-tactile-active"),
      "globals.css must define .pill-tactile-active with warm copper atelier gradient"
    );
  });

  await t.test("renders scarcity indicator with copper atelier accent", () => {
    assert.ok(pdpClient.includes("AVAILABILITY"), "Must render AVAILABILITY label");
    assert.ok(
      pdpClient.includes("ONLY 1 LEFT"),
      "Must render scarcity text ONLY 1 LEFT"
    );
    assert.ok(
      css.includes(".scarcity-rose") && css.includes("#c27847"),
      "Must style scarcity indicator with rose/magenta accent #c27847"
    );
  });

  await t.test("renders glowing flame-gradient ADD TO BAG CTA and outlined checkout secondary button", () => {
    assert.ok(
      pdpClient.includes("btn-flame-magenta"),
      "Primary CTA button must use flame magenta gradient"
    );
    assert.ok(
      pdpClient.includes("ADD TO BAG →"),
      "Primary CTA button must render ADD TO BAG → text"
    );
    assert.ok(
      css.includes(".btn-flame-magenta") && css.includes("#c27847"),
      "globals.css must define warm atelier copper CTA"
    );
    assert.ok(
      pdpClient.includes("btn-outline-checkout") && pdpClient.includes("PROCEED TO CHECKOUT"),
      "Secondary button must be outlined PROCEED TO CHECKOUT"
    );
  });

  await t.test("renders collapsible referral code accordion slot", () => {
    assert.ok(
      pdpClient.includes("Have a referral code?"),
      "Must render collapsible referral accordion header"
    );
    assert.ok(
      pdpClient.includes("setShowReferralAccordion"),
      "Must allow toggling referral code slot"
    );
  });

  await t.test("preserves verbatim out-of-stock rejection error string", () => {
    assert.ok(
      pdpClient.includes("out of stock please choose a different size"),
      "Must maintain verbatim error string 'out of stock please choose a different size'"
    );
  });
});

test("R4: 'Complete the Look' Cross-Sell Pedestal Grid", async (t) => {
  const pdpClient = fs.readFileSync(
    path.join(ROOT, "app", "product", "[slug]", "ProductDetailClient.tsx"),
    "utf-8"
  );
  const cardComponent = fs.readFileSync(
    path.join(ROOT, "components", "ProductCard.tsx"),
    "utf-8"
  );

  await t.test("renders COMPLETE THE LOOK // SHOP THE PIECES section header", () => {
    assert.ok(
      pdpClient.includes("COMPLETE THE LOOK //"),
      "Must render COMPLETE THE LOOK // subtitle"
    );
    assert.ok(
      pdpClient.includes("SHOP THE PIECES"),
      "Must render SHOP THE PIECES title in Cormorant Garamond serif"
    );
  });

  await t.test("ProductCard supports upgraded brutalist pedestal variant", () => {
    assert.ok(
      cardComponent.includes('variant === "pedestal"'),
      "ProductCard must handle variant='pedestal'"
    );
    assert.ok(
      cardComponent.includes("pedestal-card-riser.webp"),
      "Pedestal variant must reference the 3D stone pedestal riser texture"
    );
    assert.ok(
      cardComponent.includes("VIEW PIECE →") || cardComponent.includes("VIEW PIECE &rarr;"),
      "Pedestal card must render VIEW PIECE action link"
    );
    assert.ok(
      cardComponent.includes("1 OF 100"),
      "Pedestal card must render 1 OF 100 atelier badge"
    );
  });

  await t.test("pedestal riser texture asset exists on disk", () => {
    const riserPath = path.join(ROOT, "public", "images", "pedestal-card-riser.webp");
    assert.ok(fs.existsSync(riserPath), "pedestal-card-riser.webp must exist");
  });
});
