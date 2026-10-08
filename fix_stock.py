# -*- coding: utf-8 -*-
with open("app/product/[slug]/ProductDetailClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "{selectedVariant ? `${selectedVariant.stock} PIECES LEFT` : `${product.stock} PIECES ALLOCATED`}",
    "{hasTop || hasBottom ? `${availableStock} PIECES LEFT` : `${product.stock} PIECES ALLOCATED`}"
)

with open("app/product/[slug]/ProductDetailClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed stock text!")

