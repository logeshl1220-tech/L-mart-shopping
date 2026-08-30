import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";

function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-16 text-[#25241f]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#dfd9cd] bg-white p-8 shadow-[0_20px_70px_rgba(50,45,35,.08)] sm:p-12">
        <p className="eyebrow">Your L-mart account</p>
        <h1 className="mt-4 font-display text-4xl tracking-[-.04em] sm:text-5xl">Shopping, kept personal.</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#6d6a61]">Sign in to continue to your saved account. Orders, delivery addresses, returns, and account history are managed through the connected Shopify customer experience.</p>
        <a className="button-primary mt-8 inline-flex" href="/api/oauth/login">Sign in to L-mart</a>
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
