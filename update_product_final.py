# -*- coding: utf-8 -*-
import re
with open("app/product/[slug]/ProductDetailClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the top variables
vars_start = content.find("const sizeVariants = useMemo")
vars_end = content.find("const items = useCartStore", vars_start)

new_vars = """const sizeVariants = useMemo(() => parseSizeVariants(product.sizes || []), [product.sizes]);
  const topVariants = useMemo(() => sizeVariants.filter(v => v.type === "top" || !v.type), [sizeVariants]);
  const bottomVariants = useMemo(() => sizeVariants.filter(v => v.type === "bottom"), [sizeVariants]);

  const defaultTopSize = useMemo(() => {
    const defaultVariant = topVariants.find(v => v.isDefault && v.stock > 0);
    if (defaultVariant) return defaultVariant.size;
    const firstInStock = topVariants.find(v => v.stock > 0);
    if (firstInStock) return firstInStock.size;
    return topVariants[0]?.size || "M";
  }, [topVariants]);

  const defaultBottomSize = useMemo(() => {
    const defaultVariant = bottomVariants.find(v => v.isDefault && v.stock > 0);
    if (defaultVariant) return defaultVariant.size;
    const firstInStock = bottomVariants.find(v => v.stock > 0);
    if (firstInStock) return firstInStock.size;
    return bottomVariants[0]?.size || "30";
  }, [bottomVariants]);

  const [selectedSize, setSelectedSize] = useState(defaultTopSize);
  const [selectedWaist, setSelectedWaist] = useState(defaultBottomSize);
  const [added, setAdded] = useState(false);
  const [soldOutError, setSoldOutError] = useState(false);
  const [showMobileSizeGuide, setShowMobileSizeGuide] = useState(false);
  const [showDesktopSizeGuide, setShowDesktopSizeGuide] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  """

content = content[:vars_start] + new_vars + content[vars_end:]

# 2. Update stock calculation
stock_start = content.find("const isOutfit = product.category?.toLowerCase()")
stock_end = content.find("const handleAddToCart = () =>", stock_start)

new_stock = """
  const hasTop = topVariants.length > 0;
  const hasBottom = bottomVariants.length > 0;
  
  let finalSize = "";
  if (hasTop && hasBottom) finalSize = `${selectedSize} / ${selectedWaist}`;
  else if (hasBottom) finalSize = selectedWaist;
  else finalSize = selectedSize;

  const selectedTopVariant = topVariants.find((v) => v.size === selectedSize);
  const selectedBottomVariant = bottomVariants.find((v) => v.size === selectedWaist);

  let availableStock = 0;
  if (hasTop && hasBottom) {
    availableStock = Math.min(selectedTopVariant?.stock || 0, selectedBottomVariant?.stock || 0);
  } else if (hasBottom) {
    availableStock = selectedBottomVariant?.stock || 0;
  } else if (hasTop) {
    availableStock = selectedTopVariant?.stock || 0;
  } else {
    availableStock = product.stock ?? 0;
  }

  const isSelectedSoldOut = availableStock <= 0;

  const sizeLabel = (() => {
    const cat = product.category?.toLowerCase() || "";
    if (cat.includes("jersey")) return "Jersey Size";
    if (cat.includes("shirt")) return "Shirt Size";
    return "Select Size";
  })();
"""

content = content[:stock_start] + new_stock + content[stock_end:]

# 3. Fix quantity checks in handleAddToCart and handleProceedToCheckout
content = content.replace('i.size.split("/")[0].trim() === selectedSize', 'i.size === finalSize')


# 4. Update the UI for size buttons
ui_start = content.find("{/* Size Selector */}")
ui_end = content.find("{/* Stock status */}", ui_start)

new_ui = """{/* Size Selector */}
       <div className="space-y-3 pt-2 mt-4">
        
        {hasTop && (
         <>
         {/* Size Guide Trigger */}
         <div className="mb-4">
           {/* Mobile Button (opens modal) */}
           <button
             type="button"
             onClick={() => setShowMobileSizeGuide(true)}
             className="md:hidden flex items-center justify-center w-full rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-accent transition-colors gap-2"
           >
             <span>📏</span> SIZE GUIDE
           </button>

           {/* Desktop Accordion Trigger */}
           <button
             type="button"
             onClick={() => setShowDesktopSizeGuide(!showDesktopSizeGuide)}
             className="hidden md:flex items-center justify-between w-full rounded-sm border border-base-border bg-base-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:border-accent transition-colors"
           >
             <div className="flex items-center gap-2">
               <span>📏</span> SIZE GUIDE
             </div>
             <span className="text-text-secondary font-mono">{showDesktopSizeGuide ? "−" : "+"}</span>
           </button>

           {/* Desktop Inline Chart */}
           {showDesktopSizeGuide && (
             <div className="hidden md:block mt-3 animate-in fade-in slide-in-from-top-2">
               <SizeChartTable />
             </div>
           )}
         </div>
         </>
        )}

        {hasTop && (
         <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary uppercase tracking-widest">{sizeLabel}</span>
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest">
           Oversized Boxy Fit
          </span>
         </div>
        )}

        {hasTop && (
        <div className="grid grid-cols-5 gap-2.5">
         {topVariants.length > 0 ? topVariants.map((variant) => {
          const isOOS = variant.stock <= 0;
          return (
           <button
            key={variant.size}
            type="button"
            onClick={() => {
             setSelectedSize(variant.size);
             if (variant.stock <= 0) {
              setSoldOutError(true);
             } else {
              setSoldOutError(false);
             }
            }}
            title={isOOS ? "Sold out" : undefined}
            className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-sm border relative cursor-pointer ${
             selectedSize === variant.size
              ? isOOS
                ? "border-red-500/60 bg-red-500/10 text-red-400 line-through shadow-sm"
                : "border-accent bg-accent/15 text-accent shadow-sm"
              : isOOS
              ? "border-base-border/40 bg-base-bg/40 text-text-secondary/40 line-through hover:border-base-border"
              : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
            }`}
            style={
             selectedSize === variant.size && !isOOS
              ? { boxShadow: "0 0 12px rgb(var(--accent) / 0.4)" }
              : undefined
            }
           >
            {variant.size}
            {isOOS && <span className="absolute -top-1 -right-1 size-2 rounded-full bg-red-500 border border-base-bg" title="Sold out" />}
           </button>
          );
         }) : ([...new Set([...(product.sizes || ["S", "M", "L", "XL"])])]).map((sz) => (
          <button
           key={sz}
           type="button"
           onClick={() => {
            setSelectedSize(sz);
            setSoldOutError(false);
           }}
           className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-sm border cursor-pointer ${
            selectedSize === sz
             ? "border-accent bg-accent/15 text-accent shadow-sm"
             : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
           }`}
           style={
            selectedSize === sz
             ? { boxShadow: "0 0 12px rgb(var(--accent) / 0.4)" }
             : undefined
           }
          >
           {sz}
          </button>
         ))}
        </div>
        )}

        {hasBottom && (
         <div className="pt-3">
          <div className="flex items-center justify-between text-xs mb-3">
           <span className="text-text-secondary uppercase tracking-widest">Select Waist Size</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
           {bottomVariants.map((variant) => {
            const isOOS = variant.stock <= 0;
            return (
            <button
             key={variant.size}
             type="button"
             onClick={() => setSelectedWaist(variant.size)}
             className={`py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-sm border relative cursor-pointer ${
              selectedWaist === variant.size
               ? isOOS
                 ? "border-red-500/60 bg-red-500/10 text-red-400 line-through shadow-sm"
                 : "border-accent bg-accent/15 text-accent shadow-sm"
               : isOOS
               ? "border-base-border/40 bg-base-bg/40 text-text-secondary/40 line-through hover:border-base-border"
               : "border-base-border bg-base-surface text-text-secondary hover:border-text-secondary hover:text-text-primary"
             }`}
             style={
              selectedWaist === variant.size && !isOOS
               ? { boxShadow: "0 0 12px rgb(var(--accent) / 0.4)" }
               : undefined
             }
            >
             {variant.size}
             {isOOS && <span className="absolute -top-1 -right-1 size-2 rounded-full bg-red-500 border border-base-bg" title="Sold out" />}
            </button>
           )})}
          </div>
         </div>
        )}
       </div>

       <div className="h-4 mt-2 mb-2">
        {soldOutError && (
         <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest animate-fade-in text-center">
          Selected size combination is out of stock.
         </p>
        )}
       </div>

       """

new_ui = new_ui.replace('${selectedSize}', '$\\{selectedSize\\}').replace('${selectedWaist}', '$\\{selectedWaist\\}')

content = content[:ui_start] + new_ui + content[ui_end:]

content = content.replace('$\\{selectedSize\\}', '${selectedSize}').replace('$\\{selectedWaist\\}', '${selectedWaist}')

with open("app/product/[slug]/ProductDetailClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProductDetailClient.tsx!")
