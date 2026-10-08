# -*- coding: utf-8 -*-
with open("app/product/[slug]/ProductDetailClient.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("!isPants", "hasTop")
content = content.replace("isPants", "!hasTop")

with open("app/product/[slug]/ProductDetailClient.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed isPants!")

