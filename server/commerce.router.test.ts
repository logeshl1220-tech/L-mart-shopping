import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockListPendingReviews = vi.hoisted(() => vi.fn());
const mockSetReviewStatus = vi.hoisted(() => vi.fn());
vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, listPendingReviews: mockListPendingReviews, setReviewStatus: mockSetReviewStatus };
});
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(user: AuthenticatedUser | null = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN = "test-token";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(data: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ data }),
    text: async () => "",
  } as Response);
}

const rawVariant = {
  id: "gid://shopify/ProductVariant/1",
  title: "Default Title",
  availableForSale: true,
  price: { amount: "385.00", currencyCode: "USD" },
  compareAtPrice: null,
  selectedOptions: [{ name: "Title", value: "Default Title" }],
};

const rawProduct = {
  id: "gid://shopify/Product/1",
  title: "Aria",
  handle: "aria",
  description: "",
  descriptionHtml: "",
  productType: "Sculpted",
  vendor: "Maison",
  tags: ["Stoneware"],
  options: [{ name: "Title", values: ["Default Title"] }],
  priceRange: {
    minVariantPrice: { amount: "385.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "385.00", currencyCode: "USD" },
  },
  images: {
    edges: [
      { node: { url: "https://img/1.jpg", altText: null, width: 800, height: 1000 } },
    ],
  },
  variants: { edges: [{ node: rawVariant }] },
};

describe("commerce.products", () => {
  it("normalizes the Storefront response into backend-agnostic Product shapes", async () => {
    ok({ products: { edges: [{ node: rawProduct }] } });

    const caller = appRouter.createCaller(makeCtx());
    const products = await caller.commerce.products.list();

    expect(products).toHaveLength(1);
    const product = products[0];
    expect(product.handle).toBe("aria");
    expect(product.images).toEqual([
      { url: "https://img/1.jpg", altText: null, width: 800, height: 1000 },
    ]);
    expect(product.priceRange.min.amount).toBe("385.00");
    expect(product.variants[0].id).toBe(rawVariant.id);
    expect(product.variants[0].selectedOptions).toEqual([
      { name: "Title", value: "Default Title" },
    ]);

    // The shape must not contain raw GraphQL edges/nodes — that would mean the
    // normalization layer leaked. Stringify and assert.
    const serialized = JSON.stringify(product);
    expect(serialized.includes("edges")).toBe(false);

    // Endpoint should hit the pinned API version.
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/2025-04\/graphql\.json$/);
    expect((init as RequestInit).headers).toMatchObject({
      "X-Shopify-Storefront-Access-Token": "test-token",
    });
  });

  it("maps a missing handle to a NOT_FOUND TRPCError", async () => {
    ok({ productByHandle: null });

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.commerce.products.byHandle({ handle: "nope" })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("commerce.cart", () => {
  it("creates a cart, normalizes lines, and appends channel=online_store to the checkout URL", async () => {
    ok({
      cartCreate: {
        cart: {
          id: "gid://shopify/Cart/1",
          checkoutUrl: "https://test.myshopify.com/checkout/abc",
          totalQuantity: 2,
          cost: {
            totalAmount: { amount: "770.00", currencyCode: "USD" },
            subtotalAmount: { amount: "770.00", currencyCode: "USD" },
          },
          lines: {
            edges: [
              {
                node: {
                  id: "gid://shopify/CartLine/1",
                  quantity: 2,
                  cost: { totalAmount: { amount: "770.00", currencyCode: "USD" } },
                  merchandise: {
                    id: rawVariant.id,
                    title: "Default Title",
                    price: { amount: "385.00", currencyCode: "USD" },
                    product: {
                      handle: "aria",
                      title: "Aria",
                      images: {
                        edges: [{ node: { url: "https://img/1.jpg", altText: null } }],
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        userErrors: [],
      },
    });

    const caller = appRouter.createCaller(makeCtx());
    const cart = await caller.commerce.cart.create({
      lines: [{ variantId: rawVariant.id, quantity: 2 }],
    });

    expect(cart.id).toBe("gid://shopify/Cart/1");
    expect(cart.itemCount).toBe(2);
    expect(cart.checkoutUrl).toMatch(/\?channel=online_store$/);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      lineId: "gid://shopify/CartLine/1",
      variantId: rawVariant.id,
      productHandle: "aria",
      quantity: 2,
    });
  });

  it("maps Shopify userErrors onto a BAD_REQUEST TRPCError", async () => {
    ok({
      cartCreate: {
        cart: null,
        userErrors: [{ message: "merchandise does not exist", field: ["lines"] }],
      },
    });

    const caller = appRouter.createCaller(makeCtx());

    await expect(
      caller.commerce.cart.create({
        lines: [{ variantId: "gid://shopify/ProductVariant/999", quantity: 1 }],
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("merchandise does not exist"),
    });
  });

  it("propagates HTTP failures as INTERNAL_SERVER_ERROR", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({}),
      text: async () => "",
    } as Response);

    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.commerce.products.list()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });
});

describe("commerce input validation", () => {
  it("rejects zero or negative cart quantities before calling Shopify", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.commerce.cart.create({
        lines: [{ variantId: "gid://shopify/ProductVariant/1", quantity: 0 }],
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("commerce customer boundaries", () => {
  it("requires authentication for wishlist reads", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.commerce.wishlist.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects review bodies that are too short", async () => {
    const user: AuthenticatedUser = {
      id: 7,
      openId: "reviewer",
      email: "reviewer@example.com",
      name: "Reviewer",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(makeCtx(user));
    await expect(caller.commerce.reviews.submit({ productHandle: "aria", rating: 5, body: "short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("commerce authorization", () => {
  it("requires authentication for wishlist add and remove", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.commerce.wishlist.add({ productHandle: "aria" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.commerce.wishlist.remove({ productHandle: "aria" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("restricts review moderation to administrators", async () => {
    const user: AuthenticatedUser = {
      id: 8,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(makeCtx(user));
    await expect(caller.commerce.reviews.pending()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.commerce.reviews.moderate({ id: 1, status: "approved" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("commerce moderation success", () => {
  it("allows an administrator to approve a pending review", async () => {
    const admin: AuthenticatedUser = {
      id: 9,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const pending = [{ id: 42, productHandle: "aria", rating: 5, title: "Lovely", body: "A genuine customer note.", createdAt: new Date(), reviewerName: "Customer" }];
    mockListPendingReviews.mockResolvedValueOnce(pending);
    mockSetReviewStatus.mockResolvedValueOnce({ updated: true as const, status: "approved" as const });
    const caller = appRouter.createCaller(makeCtx(admin));
    await expect(caller.commerce.reviews.pending()).resolves.toEqual(pending);
    await expect(caller.commerce.reviews.moderate({ id: 42, status: "approved" })).resolves.toEqual({ updated: true, status: "approved" });
    expect(mockSetReviewStatus).toHaveBeenCalledWith(42, "approved");
  });
});


describe("commerce moderation rejection", () => {
  it("allows an administrator to reject a pending review", async () => {
    const admin: AuthenticatedUser = {
      id: 10,
      openId: "admin-reject-user",
      email: "admin-reject@example.com",
      name: "Admin Reject User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    mockSetReviewStatus.mockResolvedValueOnce({ updated: true as const, status: "rejected" as const });
    const caller = appRouter.createCaller(makeCtx(admin));
    await expect(caller.commerce.reviews.moderate({ id: 43, status: "rejected" })).resolves.toEqual({ updated: true, status: "rejected" });
    expect(mockSetReviewStatus).toHaveBeenCalledWith(43, "rejected");
  });
});


describe("commerce moderation trust boundary", () => {
  it("rejects manual verifiedPurchase input at the API boundary", async () => {
    const admin: AuthenticatedUser = {
      id: 11, openId: "admin-boundary", email: "boundary@example.com", name: "Boundary Admin",
      loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(makeCtx(admin));
    await expect(caller.commerce.reviews.moderate({ id: 44, status: "approved", verifiedPurchase: true } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockSetReviewStatus).not.toHaveBeenCalledWith(44, "approved");
  });
});
