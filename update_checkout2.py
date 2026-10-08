# -*- coding: utf-8 -*-
import re
with open("app/api/checkout/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the aggregation loop
agg_old = """          for (const item of items as IncomingItem[]) {
            const pId = item.product_id || item.productId || item.lookId;
            if (!pId) continue;
            const primarySize = (item.size || "ONE SIZE").split("/")[0].trim().toUpperCase();
            const qty = item.isBundle ? 1 : Math.max(1, Number(item.quantity) || 1);
            const key = `${pId}:::${primarySize}`;
            requestedQtyByProductAndSize.set(
              key,
              (requestedQtyByProductAndSize.get(key) || 0) + qty
            );
            totalRequestedQtyByProduct.set(
              pId,
              (totalRequestedQtyByProduct.get(pId) || 0) + qty
            );
          }"""

agg_new = """          for (const item of items as IncomingItem[]) {
            const pId = item.product_id || item.productId || item.lookId;
            if (!pId) continue;
            const qty = item.isBundle ? 1 : Math.max(1, Number(item.quantity) || 1);
            
            const parts = (item.size || "ONE SIZE").split("/").map(s => s.trim().toUpperCase());
            for (const part of parts) {
              if (!part) continue;
              const key = `${pId}:::${part}`;
              requestedQtyByProductAndSize.set(
                key,
                (requestedQtyByProductAndSize.get(key) || 0) + qty
              );
            }
            
            totalRequestedQtyByProduct.set(
              pId,
              (totalRequestedQtyByProduct.get(pId) || 0) + qty
            );
          }"""

content = content.replace(agg_old, agg_new)

# Fix the validation loop
val_old = """            if (variants.length > 0) {
              for (const [key, reqQty] of requestedQtyByProductAndSize.entries()) {
                const [pId, primarySize] = key.split(":::");
                if (pId !== dbProduct.id) continue;
  
                const variant = variants.find(
                  (v) => v.size.toUpperCase() === primarySize
                );
                if (variant) {
                  if (Number(variant.stock) <= 0 && reqQty > 0) {
                    return NextResponse.json(
                      { error: "out of stock please choose a different size" },
                      { status: 400 }
                    );
                  }
                  if (reqQty > Number(variant.stock)) {
                    return NextResponse.json(
                      { error: "out of stock please choose a different size" },
                      { status: 400 }
                    );
                  }
                }
              }
            }"""

val_new = """            if (variants.length > 0) {
              for (const [key, reqQty] of requestedQtyByProductAndSize.entries()) {
                const [pId, partSize] = key.split(":::");
                if (pId !== dbProduct.id) continue;
  
                const variant = variants.find(
                  (v) => v.size.toUpperCase() === partSize
                );
                if (variant) {
                  if (Number(variant.stock) <= 0 && reqQty > 0) {
                    return NextResponse.json(
                      { error: "out of stock please choose a different size" },
                      { status: 400 }
                    );
                  }
                  if (reqQty > Number(variant.stock)) {
                    return NextResponse.json(
                      { error: "out of stock please choose a different size" },
                      { status: 400 }
                    );
                  }
                }
              }
            }"""

content = content.replace(val_old, val_new)

with open("app/api/checkout/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated checkout validation!")

