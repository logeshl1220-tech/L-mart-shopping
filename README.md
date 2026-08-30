
## Commerce boundaries

L-mart reads normalized catalog, pricing, variant, and availability data through the injected commerce procedures and hands the persistent cart to Shopify checkout. Compare-at pricing is displayed when Shopify supplies it. Discount codes and final discount application remain intentionally inside Shopify checkout, where Shopify validates eligibility, stacking, and the final payable total; no discount code is hardcoded or exposed in the storefront. Product, inventory, fulfillment, and order operations remain managed in Shopify Admin.
