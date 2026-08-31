import type { Cart } from "./types";

export function isCheckoutReady(cart: Pick<Cart, "itemCount" | "checkoutUrl"> | null | undefined) {
  return Boolean(cart?.itemCount && cart.checkoutUrl);
}
