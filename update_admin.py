# -*- coding: utf-8 -*-
import re
with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

default_top = """const DEFAULT_TOP_VARIANTS: SizeVariant[] = [
  { size: "S", stock: 100, isDefault: false, type: "top" },
  { size: "M", stock: 100, isDefault: true, type: "top" },
  { size: "L", stock: 100, isDefault: false, type: "top" },
  { size: "XL", stock: 100, isDefault: false, type: "top" },
];
const DEFAULT_BOTTOM_VARIANTS: SizeVariant[] = [
  { size: "28", stock: 100, isDefault: false, type: "bottom" },
  { size: "30", stock: 100, isDefault: true, type: "bottom" },
  { size: "32", stock: 100, isDefault: false, type: "bottom" },
  { size: "34", stock: 100, isDefault: false, type: "bottom" },
  { size: "36", stock: 100, isDefault: false, type: "bottom" },
];"""

content = re.sub(r"const DEFAULT_SIZE_VARIANTS: SizeVariant\[\] = \[.*?\];", default_top, content, flags=re.DOTALL)

states = """const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [showTopUI, setShowTopUI] = useState(false);
  const [showBottomUI, setShowBottomUI] = useState(false);
  const [newTopSizeInput, setNewTopSizeInput] = useState("");
  const [newBottomSizeInput, setNewBottomSizeInput] = useState("");"""

content = re.sub(r"const \[sizeVariants, setSizeVariants\] = useState<SizeVariant\[\]>\(DEFAULT_SIZE_VARIANTS\);\s*const \[newSizeInput, setNewSizeInput\] = useState\(\"\"\);", states, content)

content = re.sub(r"setSizeVariants\(\[\.\.\.DEFAULT_SIZE_VARIANTS\.map\(v => \(\{ \.\.\.v \}\)\)\]\);\s*setNewSizeInput\(\"\"\);", "setSizeVariants([]); setNewTopSizeInput(\"\"); setNewBottomSizeInput(\"\"); setShowTopUI(false); setShowBottomUI(false);", content)

content = re.sub(r"setSizeVariants\(variants\.length > 0 \? variants : \[\.\.\.DEFAULT_SIZE_VARIANTS\.map\(v => \(\{ \.\.\.v \}\)\)\]\);\s*setNewSizeInput\(\"\"\);", "setSizeVariants(variants); setShowTopUI(variants.some(v => v.type === \"top\")); setShowBottomUI(variants.some(v => v.type === \"bottom\")); setNewTopSizeInput(\"\"); setNewBottomSizeInput(\"\");", content)


ui = """{/* SIZE VARIANTS MANAGER */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-secondary mb-3 font-medium">
                    Sizes & Stock
                  </label>
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!showTopUI) {
                          setShowTopUI(true);
                          if (!sizeVariants.some(v => v.type === "top")) {
                            setSizeVariants(prev => [...prev, ...DEFAULT_TOP_VARIANTS.map(v => ({...v}))]);
                          }
                        } else {
                          setShowTopUI(false);
                          setSizeVariants(prev => prev.filter(v => v.type !== "top"));
                        }
                      }}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-colors ${showTopUI ? "border-accent bg-accent/10 text-accent" : "border-base-border text-text-secondary hover:border-accent/50 hover:text-text-primary"}`}
                    >
                      TOP SIZE
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!showBottomUI) {
                          setShowBottomUI(true);
                          if (!sizeVariants.some(v => v.type === "bottom")) {
                            setSizeVariants(prev => [...prev, ...DEFAULT_BOTTOM_VARIANTS.map(v => ({...v}))]);
                          }
                        } else {
                          setShowBottomUI(false);
                          setSizeVariants(prev => prev.filter(v => v.type !== "bottom"));
                        }
                      }}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-colors ${showBottomUI ? "border-accent bg-accent/10 text-accent" : "border-base-border text-text-secondary hover:border-accent/50 hover:text-text-primary"}`}
                    >
                      BOTTOM SIZE
                    </button>
                  </div>

                  {showTopUI && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Top Sizes</p>
                      <div className="rounded-sm border border-base-border bg-base-bg overflow-hidden">
                        <div className="grid grid-cols-[auto_1fr_80px_32px] gap-2 px-3 py-2 border-b border-base-border bg-base-surface/50 text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                          <span>Default</span>
                          <span>Size</span>
                          <span>Stock</span>
                          <span></span>
                        </div>
                        {sizeVariants.map((variant, idx) => variant.type === "top" && (
                          <div key={idx} className="grid grid-cols-[auto_1fr_80px_32px] gap-2 items-center px-3 py-2 border-b border-base-border/40 last:border-0">
                            <input
                              type="radio"
                              name="defaultTopSize"
                              checked={!!variant.isDefault}
                              onChange={() => setSizeVariants(sizeVariants.map((v, i) => v.type === "top" ? { ...v, isDefault: i === idx } : v))}
                              className="accent-accent cursor-pointer"
                            />
                            <span className="text-xs font-bold text-text-primary font-mono">{variant.size}</span>
                            <input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) => setSizeVariants(sizeVariants.map((v, i) => i === idx ? { ...v, stock: Number(e.target.value) } : v))}
                              className="w-full rounded-sm border border-base-border bg-base-surface px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setSizeVariants(sizeVariants.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors"
                            >X</button>
                          </div>
                        ))}
                        <div className="flex px-3 py-2 bg-base-surface/30">
                          <input
                            type="text"
                            value={newTopSizeInput}
                            onChange={(e) => setNewTopSizeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const s = newTopSizeInput.trim();
                                if (s && !sizeVariants.some(v => v.size === s && v.type === "top")) {
                                  setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "top" }]);
                                  setNewTopSizeInput("");
                                }
                              }
                            }}
                            placeholder="Add top size (e.g. XXL)"
                            className="w-full bg-transparent text-xs text-text-primary focus:outline-none placeholder:text-text-secondary/50 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const s = newTopSizeInput.trim();
                              if (s && !sizeVariants.some(v => v.size === s && v.type === "top")) {
                                setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "top" }]);
                                setNewTopSizeInput("");
                              }
                            }}
                            className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline whitespace-nowrap ml-2"
                          >Add</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showBottomUI && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Bottom Sizes</p>
                      <div className="rounded-sm border border-base-border bg-base-bg overflow-hidden">
                        <div className="grid grid-cols-[auto_1fr_80px_32px] gap-2 px-3 py-2 border-b border-base-border bg-base-surface/50 text-[9px] font-bold uppercase tracking-widest text-text-secondary">
                          <span>Default</span>
                          <span>Size</span>
                          <span>Stock</span>
                          <span></span>
                        </div>
                        {sizeVariants.map((variant, idx) => variant.type === "bottom" && (
                          <div key={idx} className="grid grid-cols-[auto_1fr_80px_32px] gap-2 items-center px-3 py-2 border-b border-base-border/40 last:border-0">
                            <input
                              type="radio"
                              name="defaultBottomSize"
                              checked={!!variant.isDefault}
                              onChange={() => setSizeVariants(sizeVariants.map((v, i) => v.type === "bottom" ? { ...v, isDefault: i === idx } : v))}
                              className="accent-accent cursor-pointer"
                            />
                            <span className="text-xs font-bold text-text-primary font-mono">{variant.size}</span>
                            <input
                              type="number"
                              min={0}
                              value={variant.stock}
                              onChange={(e) => setSizeVariants(sizeVariants.map((v, i) => i === idx ? { ...v, stock: Number(e.target.value) } : v))}
                              className="w-full rounded-sm border border-base-border bg-base-surface px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setSizeVariants(sizeVariants.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors"
                            >X</button>
                          </div>
                        ))}
                        <div className="flex px-3 py-2 bg-base-surface/30">
                          <input
                            type="text"
                            value={newBottomSizeInput}
                            onChange={(e) => setNewBottomSizeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const s = newBottomSizeInput.trim();
                                if (s && !sizeVariants.some(v => v.size === s && v.type === "bottom")) {
                                  setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "bottom" }]);
                                  setNewBottomSizeInput("");
                                }
                              }
                            }}
                            placeholder="Add bottom size (e.g. 38)"
                            className="w-full bg-transparent text-xs text-text-primary focus:outline-none placeholder:text-text-secondary/50 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const s = newBottomSizeInput.trim();
                              if (s && !sizeVariants.some(v => v.size === s && v.type === "bottom")) {
                                setSizeVariants([...sizeVariants, { size: s, stock: 100, isDefault: false, type: "bottom" }]);
                                setNewBottomSizeInput("");
                              }
                            }}
                            className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline whitespace-nowrap ml-2"
                          >Add</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-text-secondary mt-1.5">
                    Total stock: <strong className="text-accent">{sizeVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0)}</strong> units
                  </p>
                </div>"""

start = content.find("{/* SIZE VARIANTS MANAGER */}")
end = content.find("</div>", content.find("Total stock:", start)) + 6
content = content[:start] + ui + content[end:]

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated admin page!")

