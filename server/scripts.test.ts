import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("scripts.upload", () => {
  it("should reject unsupported file formats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const invalidFile = {
      fileName: "test.txt",
      fileBase64: Buffer.from("test content").toString("base64"),
      title: "Test Script",
    };

    await expect(caller.scripts.upload(invalidFile)).rejects.toThrow(
      "Unsupported file format"
    );
  });

  it("should reject files exceeding size limit", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a buffer larger than 16MB
    const largeBuffer = Buffer.alloc(17 * 1024 * 1024);
    const largeFile = {
      fileName: "large.md",
      fileBase64: largeBuffer.toString("base64"),
      title: "Large Script",
    };

    await expect(caller.scripts.upload(largeFile)).rejects.toThrow(
      "File size exceeds 16MB limit"
    );
  });

  it("should accept markdown files", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const markdownContent = "# Test Script\n\nThis is a test teleprompter script.";
    const markdownFile = {
      fileName: "test.md",
      fileBase64: Buffer.from(markdownContent).toString("base64"),
      title: "Test Markdown Script",
    };

    const result = await caller.scripts.upload(markdownFile);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Script uploaded successfully");
  });
});

describe("scripts.list", () => {
  it("should return user scripts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const scripts = await caller.scripts.list();
    expect(Array.isArray(scripts)).toBe(true);
  });
});

describe("scripts.get", () => {
  it("should return undefined for non-existent script", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scripts.get({ id: 999999 });
    expect(result).toBeUndefined();
  });
});
