import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@shared/commerce/types";
import { ArrowRight, Heart, Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

const formatMoney = (money: { amount: string; currencyCode: string }) => new Intl.NumberFormat("en-IN", { style: "currency", currency: money.currencyCode, maximumFractionDigits: 0 }).format(Number(money.amount));

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const variant = product.variants[0];
  const compare = variant?.compareAtPrice;
  return (
    <article className="group">
      <Link href={`/product/${product.handle}`} className="block">
        <div className="product-image relative overflow-hidden rounded-[1.35rem] bg-[#ece8df]">
          {product.images[0] ? <img src={product.images[0].url} alt={product.images[0].altText ?? product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-[#918b7f]"><Sparkles /></div>}
          <span className="absolute left-3 top-3 rounded-full bg-[#fbfaf7]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-[#37352f]">{product.productType || "Featured"}</span>
          <button type="button" aria-label={`Save ${product.title}`} onClick={(event) => { event.preventDefault(); window.location.assign("/account"); }} className="absolute right-3 top-3 rounded-full bg-[#fbfaf7]/90 p-2 text-[#37352f] transition hover:bg-white"><Heart size={16} strokeWidth={1.8} /></button>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div><h3 className="font-medium tracking-[-.02em] text-[#25241f]">{product.title}</h3><p className="mt-1 text-sm text-[#777269]">{product.vendor || "L-mart edit"}</p></div>
          <div className="text-right"><p className="font-semibold text-[#25241f]">{variant ? formatMoney(variant.price) : formatMoney(product.priceRange.min)}</p>{compare && <p className="text-xs text-[#9b958a] line-through">{formatMoney(compare)}</p>}</div>
        </div>
      </Link>
      <button type="button" onClick={() => onAdd(product)} disabled={!variant?.availableForSale} className="button-secondary mt-4 w-full">{variant?.availableForSale ? "Add to bag" : "Currently unavailable"}</button>
    </article>
  );
}

function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, proceedToCheckout, loading } = useCart();
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50"><button aria-label="Close cart" className="absolute inset-0 bg-[#25241f]/30 backdrop-blur-sm" onClick={closeCart} /><aside className="cart-drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fbfaf7] p-6 shadow-2xl sm:p-8">
    <div className="flex items-center justify-between"><div><p className="eyebrow">Your bag</p><h2 className="mt-2 font-display text-3xl">A considered cart.</h2></div><button aria-label="Close cart" onClick={closeCart} className="icon-button"><X size={19} /></button></div>
    <div className="mt-8 flex-1 space-y-5 overflow-auto">{!cart?.items.length ? <div className="rounded-2xl border border-dashed border-[#d9d3c7] p-6 text-center text-sm text-[#777269]">Your bag is waiting for something good.</div> : cart.items.map(item => <div key={item.lineId} className="flex gap-3 border-b border-[#e8e2d8] pb-5"><div className="h-20 w-20 overflow-hidden rounded-xl bg-[#eeeae2]">{item.image && <img src={item.image.url} alt={item.image.altText ?? item.productTitle} className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="font-medium">{item.productTitle}</p>{item.variantTitle !== "Default Title" && <p className="text-xs text-[#777269]">{item.variantTitle}</p>}<p className="mt-1 text-sm">{formatMoney(item.unitPrice)}</p><div className="mt-3 flex items-center gap-3"><button className="qty-button" disabled={loading} onClick={() => updateQuantity(item.lineId, Math.max(0, item.quantity - 1))}>−</button><span className="text-sm">{item.quantity}</span><button className="qty-button" disabled={loading} onClick={() => updateQuantity(item.lineId, item.quantity + 1)}>+</button><button onClick={() => removeItem(item.lineId)} className="ml-auto text-xs text-[#9a5145]">Remove</button></div></div></div>)}</div>
    <div className="border-t border-[#ddd7cc] pt-5"><div className="flex justify-between text-sm text-[#777269]"><span>Subtotal</span><span className="font-semibold text-[#25241f]">{cart ? formatMoney(cart.subtotal) : "₹0"}</span></div><p className="mt-2 text-xs leading-5 text-[#969087]">Taxes and delivery are calculated securely by Shopify at checkout.</p><button className="button-primary mt-5 w-full" disabled={!cart?.itemCount || loading} onClick={proceedToCheckout}>Continue to secure checkout <ArrowRight size={16} /></button></div>
  </aside></div>;
}

export default function Home() {
  const { data: products = [], isLoading, error } = trpc.commerce.products.list.useQuery({ first: 25 });
  const { data: collections = [] } = trpc.commerce.collections.list.useQuery({ first: 12 });
  const { itemCount, openCart, addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [sort, setSort] = useState("featured");
  const [menuOpen, setMenuOpen] = useState(false);
  const types = useMemo(() => ["All", ...Array.from(new Set(products.map(product => product.productType).filter((type): type is string => Boolean(type))))], [products]);
  const filtered = useMemo(() => { const matching = products.filter(product => { const haystack = `${product.title} ${product.vendor} ${product.productType} ${product.tags.join(" ")}`.toLowerCase(); return haystack.includes(query.toLowerCase()) && (activeType === "All" || product.productType === activeType); }); return [...matching].sort((a, b) => sort === "price-low" ? Number(a.priceRange.min.amount) - Number(b.priceRange.min.amount) : sort === "price-high" ? Number(b.priceRange.min.amount) - Number(a.priceRange.min.amount) : a.title.localeCompare(b.title)); }, [products, query, activeType, sort]);
  const addProduct = async (product: Product) => { const variant = product.variants[0]; if (!variant) return; try { await addItem(variant.id); toast(`${product.title} added to your bag`); } catch { toast.error("We couldn't add that item. Please try again."); } };
  return <div className="min-h-screen bg-[#f7f4ee] text-[#25241f]">
    <div className="announcement">Complimentary delivery on orders over ₹1,500 <span>•</span> Secure checkout powered by Shopify</div>
    <header className="sticky top-0 z-40 border-b border-[#e1dbd0]/80 bg-[#f7f4ee]/90 backdrop-blur-xl"><div className="container flex h-[4.7rem] items-center gap-5"><button className="icon-button lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button><Link href="/" className="font-display text-3xl tracking-[-.07em]">L-mart<span className="text-[#a6604d]">.</span></Link><nav className={`${menuOpen ? "absolute left-0 right-0 top-[4.7rem] flex" : "hidden"} flex-col gap-5 border-b border-[#e1dbd0] bg-[#f7f4ee] p-5 lg:static lg:flex lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0`}><a href="#shop" className="nav-link">Shop</a>{collections.slice(0, 4).map(collection => <a key={collection.handle} href="#shop" className="nav-link">{collection.title}</a>)}<a href="#journal" className="nav-link">The L-mart edit</a></nav><div className="ml-auto flex items-center gap-2"><label className="search-box hidden sm:flex"><Search size={17} /><input aria-label="Search products" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the edit" /></label><Link href="/account" className="icon-button" aria-label={isAuthenticated ? "Account" : "Sign in"}>{isAuthenticated ? <span className="account-dot" /> : <span className="text-xs font-semibold">Sign in</span>}</Link><button className="cart-button" onClick={openCart} aria-label="Open shopping bag"><ShoppingBag size={18} /><span>{itemCount}</span></button></div></div>{<div className="container pb-3 sm:hidden"><label className="search-box flex"><Search size={17} /><input aria-label="Search products" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the edit" /></label></div>}</header>
    <main><section className="container hero-grid py-10 sm:py-14 lg:py-20"><div className="hero-copy"><p className="eyebrow">Everyday, elevated</p><h1 className="mt-5 max-w-2xl font-display text-6xl leading-[.93] tracking-[-.07em] sm:text-8xl">Find your <em>next</em> favourite.</h1><p className="mt-7 max-w-md text-base leading-7 text-[#6d6a61]">A thoughtful mix of useful, beautiful things—selected for the way you live now.</p><a href="#shop" className="button-primary mt-8 inline-flex">Explore the edit <ArrowRight size={16} /></a><div className="mt-12 flex items-center gap-4 text-xs uppercase tracking-[.16em] text-[#8d877b]"><span className="h-px w-12 bg-[#b7afa1]" /> New season / 2026</div></div><div className="hero-art"><div className="hero-orb" /><div className="hero-card hero-card-back" /><div className="hero-card hero-card-front"><span>LM</span><small>objects with intent</small></div><div className="hero-caption">A softer kind of shopping<br /><strong>made for everyday rituals</strong></div></div></section>
      <section id="shop" className="container pb-20"><div className="flex flex-col justify-between gap-5 border-b border-[#dcd6ca] pb-6 sm:flex-row sm:items-end"><div><p className="eyebrow">The current edit</p><h2 className="mt-3 font-display text-4xl tracking-[-.05em] sm:text-5xl">Good things, <em>well chosen.</em></h2></div><p className="max-w-xs text-sm leading-6 text-[#777269]">Live from the L-mart catalog. Inventory and availability update directly from Shopify.</p></div><div className="mt-7 flex flex-wrap items-center gap-2"><div className="flex gap-2 overflow-x-auto pb-2">{types.map(type => <button key={type} onClick={() => setActiveType(type)} className={`filter-pill ${activeType === type ? "filter-pill-active" : ""}`}>{type}</button>)}</div><label className="ml-auto flex items-center gap-2 text-xs text-[#777269]">Sort <select aria-label="Sort products" value={sort} onChange={event => setSort(event.target.value)} className="rounded-full border border-[#d8d1c5] bg-transparent px-3 py-2 text-xs text-[#37352f] outline-none"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>{error ? <div className="mt-10 rounded-2xl bg-[#fff1ed] p-6 text-sm text-[#9a5145]">We couldn't load the live catalog. Please refresh and try again.</div> : isLoading ? <div className="product-grid mt-8">{[1, 2].map(item => <div key={item} className="skeleton-card" />)}</div> : filtered.length ? <div className="product-grid mt-8">{filtered.map(product => <ProductCard key={product.id} product={product} onAdd={addProduct} />)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-[#d9d3c7] p-12 text-center text-sm text-[#777269]">No pieces match that search yet.</div>}</section>
      <section id="journal" className="container pb-24"><div className="editorial-panel"><div><p className="eyebrow text-[#d7c8ad]">The L-mart edit</p><h2 className="mt-4 max-w-xl font-display text-4xl leading-tight tracking-[-.05em] text-[#fbfaf7] sm:text-5xl">Small upgrades.<br /><em>Lasting pleasure.</em></h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#cbc5b8]">We believe the best finds are the ones that quietly become part of your every day.</p></div><div className="editorial-stamp">LM<br /><span>curated<br />with care</span></div></div></section>
    </main><footer className="border-t border-[#e1dbd0] py-8"><div className="container flex flex-col justify-between gap-3 text-xs uppercase tracking-[.14em] text-[#8d877b] sm:flex-row"><span>© 2026 L-mart</span><span>Thoughtful shopping, made simple.</span><span>Built for your everyday.</span></div></footer><CartDrawer />
  </div>;
}
