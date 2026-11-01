// Shopify variant IDs for each product size or shade, keyed "slug:variantId".
// Fill these in from the client's Shopify admin (Products → variant → ID) once the store exists:
//   "dew-serum:30ml": "gid://shopify/ProductVariant/1234567890",
// Any line without an ID here is refused at checkout so nobody is charged for the wrong thing.
export const SHOPIFY_VARIANTS: Record<string, string> = {};
