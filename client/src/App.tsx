import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import AdminReviews from "./pages/AdminReviews";
import NotFound from "./pages/NotFound";

function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-16 text-[#25241f]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#dfd9cd] bg-white p-8 shadow-[0_20px_70px_rgba(50,45,35,.08)] sm:p-12">
        <p className="eyebrow">Your L-mart account</p>
        <h1 className="mt-4 font-display text-4xl tracking-[-.04em] sm:text-5xl">Shopping, kept personal.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#6d6a61]">Sign in to continue to your saved account. Orders, delivery addresses, returns, and account history are managed through the connected Shopify customer experience.</p>
        <div className="mt-8 flex flex-wrap gap-3"><a className="button-primary inline-flex" href="/api/oauth/login">Sign in to L-mart</a><a className="button-secondary inline-flex" href="https://lmartshop-xybjqapb-falcon-boulder-35xucq5z.myshopify.com/account" target="_blank" rel="noreferrer">Open Shopify account</a></div>
        <div className="mt-10 grid gap-3 border-t border-[#e7e1d7] pt-6 sm:grid-cols-3"><div><p className="text-xs font-semibold uppercase tracking-[.12em]">Addresses</p><p className="mt-2 text-sm leading-6 text-[#777269]">Saved securely in Shopify checkout.</p></div><div><p className="text-xs font-semibold uppercase tracking-[.12em]">Order history</p><p className="mt-2 text-sm leading-6 text-[#777269]">Available in your Shopify account.</p></div><div><p className="text-xs font-semibold uppercase tracking-[.12em]">Store operations</p><a className="mt-2 inline-block text-sm text-[#a6604d] underline-offset-4 hover:underline" href="https://admin.shopify.com/store/lmartshop-xybjqapb-falcon-boulder-35xucq5z" target="_blank" rel="noreferrer">Open Shopify Admin ↗</a></div></div>
      </div>
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:handle" component={ProductDetail} />
      <Route path="/account" component={AccountPage} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
