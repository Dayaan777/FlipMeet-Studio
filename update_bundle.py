# -*- coding: utf-8 -*-
import re
with open('components/AnimeBundle.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

card_start = content.find('function IndividualCard({')
card_end = content.find('return (', card_start)

new_card = '''function IndividualCard({
  product,
  waist = false,
}: {
  product: AnimeProduct;
  waist?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  
  const topVariants = product.sizeVariants?.filter(v => v.type === "top" || !v.type) || [];
  const bottomVariants = product.sizeVariants?.filter(v => v.type === "bottom") || [];

  const defaultTopSize = topVariants.find(v => v.isDefault && v.stock > 0)?.size || topVariants.find(v => v.stock > 0)?.size || "M";
  const defaultBottomSize = bottomVariants.find(v => v.isDefault && v.stock > 0)?.size || bottomVariants.find(v => v.stock > 0)?.size || "30";

  const [selectedSize, setSelectedSize] = useState(defaultTopSize);
  const [selectedWaist, setSelectedWaist] = useState(defaultBottomSize);
  const [added, setAdded] = useState(false);
  const [soldOutError, setSoldOutError] = useState(false);

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
    availableStock = 0;
  }

  const isSelectedSoldOut = availableStock <= 0;

  const img = product.images?.[0] || "/images/products/stwd-shirt.png";

  const handleAdd = () => {
    if (isSelectedSoldOut) {
      setSoldOutError(true);
      return;
    }
    addItem({
      lookId: product.id,
      name: product.name,
      size: finalSize,
      price: product.price,
      oldPrice: product.old_price,
      quantity: 1,
      image: img,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  '''

content = content[:card_start] + new_card + content[card_end:]

ui_start = content.find('className="flex flex-wrap gap-1.5"', content.find('return (', card_start))
ui_start = content.rfind('<div', 0, ui_start)

end_btn = content.find('</button>', content.find('handleAdd', ui_start))
ui_end = content.find('</div>', end_btn) + 6

new_ui = '''<div className="flex flex-col gap-2">
        {hasTop && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {topVariants.map((variant) => {
              const isOOS = variant.stock <= 0;
              return (
                <button
                  key={variant.size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(variant.size);
                    if (isOOS) setSoldOutError(true);
                    else setSoldOutError(false);
                  }}
                  title={isOOS ? "Sold out" : undefined}
                  className={`py-1 px-2 text-[9px] font-bold uppercase tracking-widest rounded-sm border cursor-pointer ${
                    selectedSize === variant.size
                      ? isOOS ? "border-red-500/60 bg-red-500/10 text-red-400 line-through" : "border-accent bg-accent/10 text-accent"
                      : "border-base-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
                  }`}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        )}

        {hasBottom && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {bottomVariants.map((variant) => {
              const isOOS = variant.stock <= 0;
              return (
                <button
                  key={variant.size}
                  type="button"
                  onClick={() => {
                    setSelectedWaist(variant.size);
                    if (isOOS) setSoldOutError(true);
                    else setSoldOutError(false);
                  }}
                  title={isOOS ? "Sold out" : undefined}
                  className={`py-1 px-2 text-[9px] font-bold uppercase tracking-widest rounded-sm border cursor-pointer ${
                    selectedWaist === variant.size
                      ? isOOS ? "border-red-500/60 bg-red-500/10 text-red-400 line-through" : "border-accent bg-accent/10 text-accent"
                      : "border-base-border text-text-secondary hover:border-text-secondary hover:text-text-primary"
                  }`}
                >
                  {variant.size}
                </button>
              );
            })}
          </div>
        )}

        {soldOutError && (
          <p className="text-red-400 text-[9px] uppercase font-bold tracking-widest mt-1 mb-1">
            Selected size is out of stock
          </p>
        )}

        <button
          onClick={handleAdd}
          disabled={isSelectedSoldOut}
          className={`w-full py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
            added
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
              : isSelectedSoldOut
              ? "bg-base-surface text-text-secondary/50 border border-base-border cursor-not-allowed"
              : "bg-base-surface border border-base-border text-text-primary hover:border-accent hover:text-accent"
          }`}
        >
          {added ? "✓ Added" : isSelectedSoldOut ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>'''

content = content[:ui_start] + new_ui + content[ui_end:]

content = content.replace('$\\{selectedSize\\}', '${selectedSize}').replace('$\\{selectedWaist\\}', '${selectedWaist}')

with open('components/AnimeBundle.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated AnimeBundle!')
