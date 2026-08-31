import { describe, expect, it } from "vitest";
import { isCheckoutReady } from "@shared/commerce/checkout";

describe("checkout flow", () => {
  it("enables payment only when the cart has items and a provider checkout URL", () => {
    expect(isCheckoutReady({ itemCount: 1, checkoutUrl: "https://checkout.shopify.com/cart" })).toBe(true);
  });
  it("keeps payment unavailable for empty or incomplete carts", () => {
    expect(isCheckoutReady(null)).toBe(false);
    expect(isCheckoutReady({ itemCount: 0, checkoutUrl: "https://checkout.shopify.com/cart" })).toBe(false);
    expect(isCheckoutReady({ itemCount: 1, checkoutUrl: "" })).toBe(false);
  });
});
