# -*- coding: utf-8 -*-
import re
with open("app/api/checkout/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """const primarySize = (ordered.size || "").split("/")[0].trim().toUpperCase();
            const variantIndex = variants.findIndex(
              (v) => v.size.toUpperCase() === primarySize
            );
            if (variantIndex > -1) {
              const currentVariantStock = Number(variants[variantIndex].stock) || 0;
              variants[variantIndex].stock = Math.max(0, currentVariantStock - ordered.quantity);
            }"""

new_logic = """const parts = (ordered.size || "").split("/").map(s => s.trim().toUpperCase());
              for (const part of parts) {
                if (!part) continue;
                const variantIndex = variants.findIndex((v) => v.size.toUpperCase() === part);
                if (variantIndex > -1) {
                  const currentVariantStock = Number(variants[variantIndex].stock) || 0;
                  variants[variantIndex].stock = Math.max(0, currentVariantStock - ordered.quantity);
                }
              }"""

content = content.replace(old_logic, new_logic)

with open("app/api/checkout/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated checkout logic!")

