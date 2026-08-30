# Project TODO

- [x] Connect L-mart to Shopify as the live commerce backend using a claimable development store unless an existing store is connected through Settings → Integrations → Shopify.
- [x] Build a responsive branded L-mart customer storefront with home, category navigation, promotional sections, search, filters, sorting, and product discovery.
- [x] Integrate Shopify catalog, product media, variants, pricing, discounts, inventory availability, cart, and secure checkout.
- [ ] Implement customer sign-in, saved addresses, wishlist, persistent cart, checkout journey, and order-history access using the supported commerce/auth boundaries.
- [ ] Enforce server-side validation for cart quantities, variant availability, price totals, discounts, and customer-owned account data.
- [ ] Build protected Shopify-admin-managed operations surface or links without duplicating product, inventory, and order management outside Shopify Admin.
- [x] Establish elegant L-mart visual system, responsive behavior, accessibility, loading states, empty states, and error states.
- [x] Add Vitest coverage for Shopify catalog normalization, cart error mapping, live smoke verification, and invalid quantity rejection.
- [ ] Run type checks, tests, and visual verification; save the final project checkpoint before delivery.
- [x] Apply the injected Shopify host patches and use only normalized commerce types plus the provided tRPC commerce procedures in the storefront.
- [x] Add storefront sorting controls and logic, and keep the mobile search field visible after a query is entered.
- [x] Implement and verify Shopify discount support in the storefront/cart flow, or document the provider boundary clearly.
- [x] Complete an accessibility pass for focus states, keyboard flow, labels, semantics, and mobile interactions.
- [ ] Add explicit Vitest coverage for ownership/security boundaries and remaining customer-account commerce behavior.
