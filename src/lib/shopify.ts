import { SHOPIFY_VARIANTS } from "@/data/shopify";
import { ENGRAVING_MAX, cleanEngraving, getProduct, type Engraving } from "@/data/products";

// Headless checkout through the Shopify Storefront API: we build a Shopify cart from the
// bag and send the shopper to Shopify's own hosted checkout (payments, tax, shipping).
// Needs SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN. Without them the site runs in demo mode.

const API_VERSION = "2025-10";

export function shopifyConfigured() {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN);
}

export type CheckoutLine = { slug: string; variantId: string; qty: number; engraving?: Engraving };

/** Re-checks every line against the catalogue; prices are never taken from the browser. */
export function validateLines(input: unknown): CheckoutLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > 50) return null;
  const lines: CheckoutLine[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const { slug, variantId, qty, engraving } = raw as Record<string, unknown>;
    if (typeof slug !== "string" || typeof variantId !== "string") return null;
    const product = getProduct(slug);
    if (!product?.variants.some((v) => v.id === variantId)) return null;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 20) return null;
    let clean: Engraving | undefined;
    if (engraving && typeof engraving === "object") {
      const { text, style } = engraving as Record<string, unknown>;
      if (typeof text !== "string" || (style !== "foil" && style !== "etched")) return null;
      const t = cleanEngraving(text).trim();
      if (t && t.length <= ENGRAVING_MAX) clean = { text: t, style };
    }
    lines.push({ slug, variantId, qty, ...(clean ? { engraving: clean } : {}) });
  }
  return lines;
}

const CART_CREATE = `mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) { cart { checkoutUrl } userErrors { field message } }
}`;

export async function createCheckout(lines: CheckoutLine[]): Promise<{ url: string } | { error: string }> {
  const engravingVariant = process.env.SHOPIFY_ENGRAVING_VARIANT_ID;
  const cartLines = [];
  for (const l of lines) {
    const merchandiseId = SHOPIFY_VARIANTS[`${l.slug}:${l.variantId}`];
    if (!merchandiseId) return { error: `Not set up in the shop yet: ${l.slug} (${l.variantId}).` };
    cartLines.push({
      merchandiseId,
      quantity: l.qty,
      attributes: l.engraving
        ? [
            { key: "Engraving", value: l.engraving.text },
            { key: "Engraving finish", value: l.engraving.style === "foil" ? "Gold foil" : "Etched" },
          ]
        : [],
    });
    // Engraving is charged as its own line (a hidden "Engraving" product in Shopify).
    if (l.engraving) {
      if (!engravingVariant) return { error: "Engraving isn't set up in the shop yet." };
      cartLines.push({
        merchandiseId: engravingVariant,
        quantity: l.qty,
        attributes: [{ key: "For", value: `${l.slug} · ${l.engraving.text}` }],
      });
    }
  }

  const res = await fetch(`https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query: CART_CREATE, variables: { input: { lines: cartLines } } }),
    cache: "no-store",
  });
  if (!res.ok) return { error: "The shop didn't respond. Please try again." };
  const json = await res.json();
  const result = json?.data?.cartCreate;
  if (result?.userErrors?.length) return { error: result.userErrors[0].message };
  const url = result?.cart?.checkoutUrl;
  return typeof url === "string" ? { url } : { error: "Checkout couldn't be started." };
}
