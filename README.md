
## Commerce boundaries

L-mart reads normalized catalog, pricing, variant, and availability data through the injected commerce procedures and hands the persistent cart to Shopify checkout. Compare-at pricing is displayed when Shopify supplies it. Discount codes and final discount application remain intentionally inside Shopify checkout, where Shopify validates eligibility, stacking, and the final payable total; no discount code is hardcoded or exposed in the storefront. Product, inventory, fulfillment, and order operations remain managed in Shopify Admin.

## Checkout navigation test boundary

The cart payment action is covered by the tested `isCheckoutReady` contract, which enables payment only when a Shopify checkout URL and cart items are present. The final `window.location.assign` call in `CartContext.proceedToCheckout()` is intentionally kept as a thin browser navigation boundary; this project’s Vitest suite does not mount browser routing or replace `window.location` with a real navigation environment. The dedicated `/cart` page provides the visible payment action and unavailable-checkout fallback, while Shopify remains responsible for the payment page and transaction flow.
