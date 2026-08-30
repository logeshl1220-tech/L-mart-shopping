import { describe, expect, it } from "vitest";
import { filterAndSortProducts } from "@shared/commerce/discovery";
import { summarizeReviews } from "@shared/commerce/reviews";
import type { Product } from "@shared/commerce/types";

const product = (title: string, amount: string, tags: string[], available = true): Product => ({
  id: title,
  handle: title.toLowerCase().replaceAll(" ", "-"),
  title,
  description: "",
  descriptionHtml: "",
  productType: "Objects",
  vendor: "L-mart",
  tags,
  images: [],
  priceRange: { min: { amount, currencyCode: "INR" }, max: { amount, currencyCode: "INR" } },
  options: [],
  variants: [{ id: `${title}-variant`, title: "Default", price: { amount, currencyCode: "INR" }, compareAtPrice: null, availableForSale: available, selectedOptions: [] }],
});

const products = [product("Zebra Lamp", "1800", ["Home"]), product("Aria Tote", "900", ["Bags"]), product("Moss Tray", "1200", ["Home"], false)];

describe("catalog discovery", () => {
  it("filters by tag, price, and live availability", () => {
    expect(filterAndSortProducts(products, { tag: "Home", minPrice: "1000", inStockOnly: true })).toHaveLength(1);
    expect(filterAndSortProducts(products, { tag: "Home", minPrice: "1000", inStockOnly: true })[0]?.title).toBe("Zebra Lamp");
  });

  it("preserves featured order and implements exact title and price sort modes", () => {
    expect(filterAndSortProducts(products, { sort: "featured" }).map(item => item.title)).toEqual(["Zebra Lamp", "Aria Tote", "Moss Tray"]);
    expect(filterAndSortProducts(products, { sort: "title-asc" }).map(item => item.title)).toEqual(["Aria Tote", "Moss Tray", "Zebra Lamp"]);
    expect(filterAndSortProducts(products, { sort: "title-desc" }).map(item => item.title)).toEqual(["Zebra Lamp", "Moss Tray", "Aria Tote"]);
    expect(filterAndSortProducts(products, { sort: "price-low" }).map(item => item.title)).toEqual(["Aria Tote", "Moss Tray", "Zebra Lamp"]);
  });
});

describe("review summaries", () => {
  it("aggregates only the supplied approved-review scores", () => {
    expect(summarizeReviews([{ rating: 5 }, { rating: 3 }])).toEqual({ count: 2, average: 4 });
    expect(summarizeReviews([])).toEqual({ count: 0, average: null });
  });
});
