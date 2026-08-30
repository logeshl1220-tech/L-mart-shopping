import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, wishlistItems, productReviews } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listWishlistItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.createdAt));
}

export async function addWishlistItem(userId: number, productHandle: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(wishlistItems).values({ userId, productHandle }).onDuplicateKeyUpdate({ set: { productHandle } });
  return listWishlistItems(userId);
}

export async function removeWishlistItem(userId: number, productHandle: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productHandle, productHandle)));
  return listWishlistItems(userId);
}

export async function listApprovedReviews(productHandle: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: productReviews.id, productHandle: productReviews.productHandle, rating: productReviews.rating, title: productReviews.title, body: productReviews.body, createdAt: productReviews.createdAt, reviewerName: users.name })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(and(eq(productReviews.productHandle, productHandle), eq(productReviews.status, "approved")))
    .orderBy(desc(productReviews.createdAt));
}

export async function createPendingReview(userId: number, productHandle: string, rating: number, title: string | null, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(productReviews).values({ userId, productHandle, rating, title, body, status: "pending" });
  return { submitted: true as const, status: "pending" as const };
}

export async function listPendingReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: productReviews.id, productHandle: productReviews.productHandle, rating: productReviews.rating, title: productReviews.title, body: productReviews.body, createdAt: productReviews.createdAt, reviewerName: users.name })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(eq(productReviews.status, "pending"))
    .orderBy(desc(productReviews.createdAt));
}

export async function setReviewStatus(id: number, status: "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(productReviews).set({ status }).where(eq(productReviews.id, id));
  return { updated: true as const, status };
}

