# -*- coding: utf-8 -*-
with open('components/AnimeBundle.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('      </div>\n  );\n}\n\n// ── Buy Bundle Popup ──', '      </div>\n    </div>\n  );\n}\n\n// ── Buy Bundle Popup ──')

with open('components/AnimeBundle.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed AnimeBundle!')
