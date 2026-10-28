# Cosmetic site (working name: Solenne)

Next.js 16 + React Three Fiber. Hybrid 3D: the home hero and product viewer are 3D, everything else is regular HTML.

```bash
npm run dev    # http://localhost:3000
npm run build
```

## Where things live

| What | File |
|---|---|
| Products, prices, actives, shades | `src/data/products.ts` |
| 3D bottles (procedural, swap for real .glb later) | `src/components/three/Bottle.tsx` |
| Home hero: scroll-driven glass bottle + word behind it | `src/components/HomeHero.tsx`, `src/components/three/HeroScene.tsx` |
| Product page 3D viewer | `src/components/three/ProductViewer.tsx`, `src/components/ProductDetail.tsx` |
| 3D choreography: shared easings, timings, scroll windows | `src/components/three/motion.ts` |
| "Open the formula": cap lifts, actives rise as droplets sized by % | `src/components/three/Formula.tsx` |
| Lighting | `src/components/three/Studio.tsx` |
| Colours and fonts | `src/app/globals.css`, `src/app/layout.tsx` |
| Bag (saved in the browser) | `src/lib/cart.tsx` |

## Placeholders to replace with client info

- Brand name "Solenne", logo, palette, fonts
- All products, prices, percentages and copy
- About page story, contact email, social links
- Real 3D models (.glb) instead of the procedural bottles
- Checkout (Shopify / Stripe), newsletter and contact form backends
