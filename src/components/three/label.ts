import * as THREE from "three";
import type { Product } from "@/data/products";

// Prints a product label onto a canvas, used as a texture on the bottle.
// The label carries the brand's thesis: the lead active at its exact percentage,
// set in the same whisper-weight type as the site's display headings.

export const FAMILY = "OnestLabel";
let fontsReady: Promise<unknown> | null = null;

export function loadFonts() {
  if (!fontsReady) {
    const faces = [
      new FontFace(FAMILY, "url(/fonts/onest-200.woff)", { weight: "200" }),
      new FontFace(FAMILY, "url(/fonts/onest-500.woff)", { weight: "500" }),
    ];
    fontsReady = Promise.all(
      faces.map((f) =>
        f.load().then((loaded) => {
          document.fonts.add(loaded);
        }),
      ),
    ).catch(() => {});
  }
  return fontsReady;
}

type LabelOptions = { aspect: number; dark?: boolean };

export function createLabelTexture(product: Product, { aspect, dark = false }: LabelOptions) {
  const H = 512;
  const W = Math.round(H * aspect);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ink = dark ? "#f4efe9" : "#0d1717";
    const soft = dark ? "rgba(244,239,233,0.6)" : "#818181";

    ctx.clearRect(0, 0, W, H);
    if (!dark) {
      ctx.fillStyle = "#fbf8f4";
      ctx.fillRect(0, 0, W, H);
    }

    // Centre the printed block on the front of the arc.
    const blockW = Math.min(W * 0.62, H * 1.05);
    const x = (W - blockW) / 2;
    const pad = H * 0.09;
    const lead = product.actives[0];

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = ink;
    ctx.font = `500 ${H * 0.055}px ${FAMILY}`;
    ctx.letterSpacing = `${H * 0.018}px`;
    ctx.fillText("SOLENNE", x, pad + H * 0.04);

    ctx.letterSpacing = `${-H * 0.004}px`;
    ctx.font = `200 ${H * 0.085}px ${FAMILY}`;
    ctx.fillText(product.name, x, pad + H * 0.17);

    ctx.fillStyle = soft;
    ctx.fillRect(x, pad + H * 0.22, blockW, Math.max(1, H * 0.003));

    ctx.fillStyle = ink;
    ctx.font = `200 ${H * 0.4}px ${FAMILY}`;
    ctx.letterSpacing = `${-H * 0.03}px`;
    ctx.fillText(`${lead.percent}%`, x - H * 0.015, pad + H * 0.58);

    ctx.letterSpacing = "0px";
    ctx.font = `500 ${H * 0.05}px ${FAMILY}`;
    ctx.fillText(lead.name, x, pad + H * 0.67);

    ctx.fillStyle = soft;
    ctx.font = `500 ${H * 0.045}px ${FAMILY}`;
    const size = product.variants.at(-1)!.label;
    ctx.fillText(`${product.kind}`, x, H - pad);
    const sw = ctx.measureText(size).width;
    ctx.fillText(size, x + blockW - sw, H - pad);

    texture.needsUpdate = true;
  };

  draw();
  loadFonts().then(draw);
  return texture;
}

/**
 * Personal engraving on the back of the glass: transparent canvas, letters only.
 * Foil is drawn as a gold gradient; etched is plain white and shown as frosted glass.
 */
export function createEngravingTexture(text: string, style: "foil" | "etched", aspect: number) {
  const H = 256;
  const W = Math.round(H * aspect);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (!text) {
      texture.needsUpdate = true;
      return;
    }
    // Fit the line to about half the wrap so it sits on the back face, not around the sides.
    const maxW = W * 0.5;
    let size = H * 0.36;
    const weight = style === "foil" ? 500 : 200;
    const track = style === "foil" ? 0.12 : 0.02;
    const set = () => {
      ctx.font = `${weight} ${size}px ${FAMILY}`;
      ctx.letterSpacing = `${size * track}px`;
    };
    set();
    while (ctx.measureText(text).width > maxW && size > H * 0.12) {
      size *= 0.92;
      set();
    }
    const w = ctx.measureText(text).width;
    const x = (W - w) / 2;
    const y = H / 2 + size * 0.35;

    if (style === "foil") {
      const g = ctx.createLinearGradient(x, y - size, x + w, y);
      g.addColorStop(0, "#9c7a45");
      g.addColorStop(0.3, "#f6e7c8");
      g.addColorStop(0.55, "#d6b47c");
      g.addColorStop(0.8, "#fff1d6");
      g.addColorStop(1, "#b08a52");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = "#ffffff";
    }
    ctx.fillText(text, x, y);

    // A hairline under the name, like a jeweller's mark.
    ctx.globalAlpha = 0.7;
    ctx.fillRect(W / 2 - size * 0.5, y + size * 0.28, size, Math.max(1, H * 0.006));
    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  };

  draw();
  loadFonts().then(draw);
  return texture;
}
