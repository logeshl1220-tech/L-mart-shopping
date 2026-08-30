# Project TODO

- [x] Connect L-mart to Shopify as the live commerce backend using a claimable development store unless an existing store is connected through Settings → Integrations → Shopify.
- [x] Build a responsive branded L-mart customer storefront with home, category navigation, promotional sections, search, filters, sorting, and product discovery.
- [x] Integrate Shopify catalog, product media, variants, pricing, discounts, inventory availability, cart, and secure checkout.
- [x] Implement customer sign-in entry, persistent Shopify cart, secure checkout journey, and account links for Shopify-managed addresses and order history; wishlist actions provide an explicit sign-in handoff without fabricated customer data.
- [x] Enforce the available server-side commerce boundary through typed Shopify cart procedures, including quantity validation, variant availability, Shopify-calculated totals, and Shopify-owned discount/customer data.
- [x] Build a Shopify-admin-managed operations handoff without duplicating product, inventory, and order management outside Shopify Admin.
- [x] Establish elegant L-mart visual system, responsive behavior, accessibility, loading states, empty states, and error states.
- [x] Add Vitest coverage for Shopify catalog normalization, cart error mapping, live smoke verification, and invalid quantity rejection.
- [x] Run type checks, tests, and visual verification; save the final project checkpoint before delivery.
- [x] Apply the injected Shopify host patches and use only normalized commerce types plus the provided tRPC commerce procedures in the storefront.
- [x] Add storefront sorting controls and logic, and keep the mobile search field visible after a query is entered.
- [x] Implement and verify Shopify discount support in the storefront/cart flow, or document the provider boundary clearly.
- [x] Complete an accessibility pass for focus states, keyboard flow, labels, semantics, and mobile interactions.
- [x] Document the Shopify ownership boundary for customer accounts and admin-managed orders; retain injected commerce tests plus explicit invalid-quantity coverage.
