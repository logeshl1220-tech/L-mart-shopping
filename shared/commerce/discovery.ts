import type { Product } from "./types";

export type DiscoveryOptions = {
  query?: string;
  productType?: string;
  tag?: string;
  minPrice?: string;
  maxPrice?: string;
  inStockOnly?: boolean;
  sort?: "featured" | "title-asc" | "title-desc" | "price-low" | "price-high";
};

export function filterAndSortProducts(products: Product[], options: DiscoveryOptions = {}) {
  const normalizedQuery = options.query?.trim().toLowerCase() ?? "";
  const matching = products.filter(product => {
    const haystack = `${product.title} ${product.vendor ?? ""} ${product.productType ?? ""} ${product.tags.join(" ")}`.toLowerCase();
    const price = Number(product.priceRange.min.amount);
    const available = product.variants.some(variant => variant.availableForSale);
    return haystack.includes(normalizedQuery)
      && (!options.productType || options.productType === "All" || product.productType === options.productType)
      && (!options.tag || options.tag === "All tags" || product.tags.includes(options.tag))
      && (!options.minPrice || price >= Number(options.minPrice))
      && (!options.maxPrice || price <= Number(options.maxPrice))
      && (!options.inStockOnly || available);
  });

  if (!options.sort || options.sort === "featured") return matching;
  return [...matching].sort((a, b) => {
    if (options.sort === "price-low") return Number(a.priceRange.min.amount) - Number(b.priceRange.min.amount);
    if (options.sort === "price-high") return Number(b.priceRange.min.amount) - Number(a.priceRange.min.amount);
    const comparison = a.title.localeCompare(b.title);
    return options.sort === "title-desc" ? -comparison : comparison;
  });
}
