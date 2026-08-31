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

## Enhancement request

- [x] Add database-backed wishlist persistence per authenticated customer, with add/remove/list behavior across sessions.
- [x] Add advanced listing filters for product type, price range, availability, and tags, plus explicit sort modes.
- [x] Add genuine customer review submission, moderation state, rating aggregation, and honest empty states without seeded reviews or ratings.
- [x] Add/update Vitest coverage for wishlist authentication boundaries, review validation, cart validation, catalog normalization, and live commerce smoke behavior.
- [x] Re-run type checks, tests, build, responsive visual verification, and save an enhancement checkpoint.

## Verification follow-up

- [x] Correct sort labels and behavior so Featured, A–Z, Z–A, and price modes match their visible semantics.
- [x] Add Vitest coverage for wishlist add/remove authorization, approved-review aggregation, moderation behavior, and advanced filter/sort logic.

## Final verification follow-up

- [x] Run mobile visual verification for the wishlist, advanced filters, and product review flows, then save a new enhancement checkpoint.
- [x] Add Vitest coverage for successful administrator review approval/rejection behavior.

## Delivery follow-up

- [x] Add successful administrator rejection coverage for pending reviews.
- [x] Save a new enhancement checkpoint after all wishlist, discovery, review, and responsive verification work.

## New enhancement request

- [ ] Keep verified-purchase badges disabled until a real Shopify order/customer reconciliation path is available; do not permit manual evidence claims.
- [x] Integrate a fuller customer account flow for profile, saved addresses, order history, sign-in, and sign-out using the app session plus Shopify customer-account handoff.
- [x] Add recently viewed products with bounded resilient localStorage persistence and homepage/product-detail sections.
- [x] Enhance the slide-out cart drawer with visible line management, totals, and a Quick checkout with Shopify action.
- [x] Package the reusable L-mart Shopify storefront workflow as a validated skill using skill-creator.
- [x] Add/update tests, run fresh mobile verification for the newest changes, save a final checkpoint, and deliver the project plus skill.
- [x] Harden recently viewed localStorage parsing against malformed browser data and run fresh mobile verification after the newest changes.
