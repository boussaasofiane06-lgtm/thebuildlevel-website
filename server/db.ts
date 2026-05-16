import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

// Parse DATABASE_URL and handle SSL params that mysql2 can't read from URL string.
// TiDB Cloud uses ?ssl={"rejectUnauthorized":true} or ?ssl=require which mysql2 ignores.
function buildPoolConfig(rawUrl: string): mysql.PoolOptions {
  try {
    const parsed = new URL(rawUrl);
    const sslParam = parsed.searchParams.get('ssl');
    if (!sslParam) {
      return { uri: rawUrl };
    }
    // Remove ssl from URL, pass it as object
    parsed.searchParams.delete('ssl');
    const cleanUrl = parsed.toString();
    let sslConfig: mysql.SslOptions;
    if (sslParam === 'require' || sslParam === 'true') {
      sslConfig = { rejectUnauthorized: false };
    } else {
      try {
        sslConfig = JSON.parse(sslParam);
      } catch {
        sslConfig = { rejectUnauthorized: false };
      }
    }
    return { uri: cleanUrl, ssl: sslConfig };
  } catch {
    return { uri: rawUrl };
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const config = buildPoolConfig(process.env.DATABASE_URL);
      const pool = mysql.createPool(config);
      // Verify connection works
      await pool.query('SELECT 1');
      _db = drizzle(pool);
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
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

    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (existing.length > 0) {
      await db.update(users).set({ ...updateSet, updatedAt: new Date() }).where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values({ ...values, createdAt: new Date(), updatedAt: new Date() });
    }
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

// TODO: add feature queries here as your schema grows.
