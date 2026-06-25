const fs = require('fs');
const file = 'frontend/src/app/page.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Add imports after Link
const linkIndex = lines.findIndex(l => l.includes('import Link from "next/link";'));
lines.splice(linkIndex + 1, 0, 'import { glass } from "@/utils/theme";', 'import ProductCard, { Product, ProductSkeleton } from "@/components/ProductCard";');

let content = lines.join('\n');

// Remove interface Product
content = content.replace(/interface Product \{[\s\S]*?\n\}\n/, '');

// Remove const glass
content = content.replace(/const glass = \{[\s\S]*?\} as React\.CSSProperties,\r?\n\};\r?\n/, '');

// Remove function ProductSkeleton
content = content.replace(/function ProductSkeleton\(\) \{[\s\S]*?\n\}\n/, '');

// Remove function ProductCard
content = content.replace(/\/\/ ─── PRODUCT CARD COMPONENT ───────────────────────────────────────────────────\r?\nfunction ProductCard\(\{ product \}: \{ product: Product \}\) \{[\s\S]*?\n\}\n/, '');

fs.writeFileSync(file, content);
console.log('page.tsx updated successfully');
