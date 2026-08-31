import { Link } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const KEY = "lmart:recently-viewed";
function readHandles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 6) : [];
  } catch { return []; }
}
export function rememberViewed(handle: string) {
  if (typeof window === "undefined") return;
  const existing = readHandles();
  window.localStorage.setItem(KEY, JSON.stringify([handle, ...existing.filter(item => item !== handle)].slice(0, 6)));
}
export default function RecentlyViewed({ exclude }: { exclude?: string }) {
  const handles = readHandles();
  const { data: products = [] } = trpc.commerce.products.list.useQuery({ first: 100 }, { enabled: handles.length > 0 });
  const viewed = handles.filter(handle => handle !== exclude).map(handle => products.find(product => product.handle === handle)).filter(Boolean);
  if (!viewed.length) return null;
  return <section className="container pb-20"><div className="flex items-end justify-between border-b border-[#dcd6ca] pb-5"><div><p className="eyebrow">Keep exploring</p><h2 className="mt-3 font-display text-4xl tracking-[-.05em]">Recently viewed.</h2></div></div><div className="product-grid mt-8">{viewed.map(product => product && <Link key={product.id} href={`/product/${product.handle}`} className="group"><div className="product-image overflow-hidden rounded-[1.35rem] bg-[#ece8df]">{product.images[0] && <img src={product.images[0].url} alt={product.images[0].altText ?? product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />}</div><h3 className="mt-4 font-medium">{product.title}</h3><p className="mt-1 text-sm text-[#777269]">{product.vendor || "L-mart"}</p></Link>)}</div></section>;
}
