import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, scripts, recordings, InsertScript, InsertRecording } from "../drizzle/schema";
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

// Script management queries
export async function createScript(script: InsertScript) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(scripts).values(script);
  return result;
}

export async function getUserScripts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(scripts).where(eq(scripts.userId, userId)).orderBy(desc(scripts.createdAt));
}

export async function getScriptById(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(scripts).where(eq(scripts.id, scriptId)).limit(1);
  
  if (result.length === 0) return undefined;
  
  // Verify ownership
  if (result[0].userId !== userId) {
    throw new Error("Unauthorized access to script");
  }
  
  return result[0];
}

export async function deleteScript(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First verify ownership
  const script = await getScriptById(scriptId, userId);
  if (!script) {
    throw new Error("Script not found");
  }
  
  await db.delete(scripts).where(eq(scripts.id, scriptId));
}

// Recording management queries
export async function createRecording(recording: InsertRecording) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(recordings).values(recording);
  return result;
}

export async function getScriptRecordings(scriptId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(recordings)
    .where(eq(recordings.scriptId, scriptId))
    .orderBy(desc(recordings.createdAt));
}

export async function updateRecordingTranscription(recordingId: number, transcription: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(recordings)
    .set({ transcription })
    .where(eq(recordings.id, recordingId));
}
