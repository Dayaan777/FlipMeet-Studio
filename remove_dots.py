# -*- coding: utf-8 -*-
with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('grid-cols-[auto_1fr_80px_32px]', 'grid-cols-[1fr_80px_32px]')

content = content.replace('<span>Default</span>\n                          <span>Size</span>', '<span>Size</span>')

old_radio = '''<input
                              type="radio"
                              name="defaultBottomSize"
                              checked={!!variant.isDefault}
                              onChange={() => setSizeVariants(sizeVariants.map((v, i) => v.type === "bottom" ? { ...v, isDefault: i === idx } : v))}
                              className="accent-accent cursor-pointer"
                            />'''
content = content.replace(old_radio, "")

old_radio_top = '''<input
                              type="radio"
                              name="defaultTopSize"
                              checked={!!variant.isDefault}
                              onChange={() => setSizeVariants(sizeVariants.map((v, i) => v.type === "top" ? { ...v, isDefault: i === idx } : v))}
                              className="accent-accent cursor-pointer"
                            />'''
content = content.replace(old_radio_top, "")

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed radio dots!")
