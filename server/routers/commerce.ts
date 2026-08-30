/**
 * Commerce router — backend-agnostic tRPC surface for the storefront.
 *
 * The router is intentionally thin: zod validates input, then delegates to the
 * named functions exported from `server/_core/shopify`. If we ever swap
 * commerce backends, only `_core/shopify.ts` + `_core/shopifyNormalize.ts`
 * change — this router stays put.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  addCartLines,
  createCart,
  getCart,
  getCollectionByHandle,
  getProductByHandle,
  listCollections,
  listProducts,
  removeCartLines,
  updateCartLines,
} from "../_core/shopify";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { addWishlistItem, createPendingReview, listApprovedReviews, listPendingReviews, listWishlistItems, removeWishlistItem, setReviewStatus } from "../db";
import { summarizeReviews } from "@shared/commerce/reviews";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});

const cartLineInputSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

const cartLineUpdateSchema = z.object({
  lineId: z.string().min(1),
  /** 0 means "remove this line" — the route forwards to removeLines. */
  quantity: z.number().int().min(0).max(99),
});

export const commerceRouter = router({
  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            first: z.number().int().min(1).max(100).optional(),
            collectionHandle: z.string().min(1).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return listProducts(input ?? {});
      }),
    byHandle: publicProcedure
      .input(z.object({ handle: z.string().min(1) }))
      .query(async ({ input }) => {
        return getProductByHandle(input.handle);
      }),
  }),
  collections: router({
    list: publicProcedure
      .input(z.object({ first: z.number().int().min(1).max(50).optional() }).optional())
      .query(async ({ input }) => {
        return listCollections(input?.first);
      }),
    byHandle: publicProcedure
      .input(z.object({ handle: z.string().min(1) }))
      .query(async ({ input }) => {
        return getCollectionByHandle(input.handle);
      }),
  }),
  cart: router({
    create: publicProcedure
      .input(z.object({ lines: z.array(cartLineInputSchema).min(1).max(50) }))
      .mutation(async ({ input }) => {
        return createCart(input.lines);
      }),
    get: publicProcedure
      .input(z.object({ cartId: z.string().min(1) }))
      .query(async ({ input }) => {
        return getCart(input.cartId);
      }),
    addLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lines: z.array(cartLineInputSchema).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        return addCartLines(input.cartId, input.lines);
      }),
    updateLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lines: z.array(cartLineUpdateSchema).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        // qty 0 means "remove this line" — split the request so the client
        // never has to call two procedures for a single user gesture.
        const toRemove = input.lines.filter(l => l.quantity === 0).map(l => l.lineId);
        const toUpdate = input.lines.filter(l => l.quantity > 0);

        let cart = null;
        if (toUpdate.length) {
          cart = await updateCartLines(input.cartId, toUpdate);
        }
        if (toRemove.length) {
          cart = await removeCartLines(input.cartId, toRemove);
        }
        if (!cart) cart = await getCart(input.cartId);
        return cart;
      }),
    removeLines: publicProcedure
      .input(
        z.object({
          cartId: z.string().min(1),
          lineIds: z.array(z.string().min(1)).min(1).max(50),
        })
      )
      .mutation(async ({ input }) => {
        return removeCartLines(input.cartId, input.lineIds);
      }),
  }),
  wishlist: router({
    list: protectedProcedure.query(({ ctx }) => listWishlistItems(ctx.user.id)),
    add: protectedProcedure.input(z.object({ productHandle: z.string().min(1).max(255) })).mutation(({ ctx, input }) => addWishlistItem(ctx.user.id, input.productHandle)),
    remove: protectedProcedure.input(z.object({ productHandle: z.string().min(1).max(255) })).mutation(({ ctx, input }) => removeWishlistItem(ctx.user.id, input.productHandle)),
  }),
  reviews: router({
    list: publicProcedure.input(z.object({ productHandle: z.string().min(1).max(255) })).query(async ({ input }) => {
      const reviews = await listApprovedReviews(input.productHandle);
      return { reviews, ...summarizeReviews(reviews) };
    }),
    submit: protectedProcedure.input(z.object({ productHandle: z.string().min(1).max(255), rating: z.number().int().min(1).max(5), title: z.string().trim().max(160).optional(), body: z.string().trim().min(10).max(4000) })).mutation(({ ctx, input }) => createPendingReview(ctx.user.id, input.productHandle, input.rating, input.title?.trim() || null, input.body.trim())),
    pending: adminProcedure.query(() => listPendingReviews()),
    moderate: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["approved", "rejected"]) })).mutation(({ input }) => setReviewStatus(input.id, input.status)),
  }),
});

export type CommerceRouter = typeof commerceRouter;
