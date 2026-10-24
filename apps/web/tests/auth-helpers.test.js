import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  validateEmail,
  validatePassword,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "../lib/auth-helpers.js";

describe("hashPassword / verifyPassword", () => {
  it("produces a hash that verifies correctly", async () => {
    const hash = await hashPassword("mySecret123");
    expect(await verifyPassword("mySecret123", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("mySecret123");
    expect(await verifyPassword("wrongPassword", hash)).toBe(false);
  });
});

describe("generateToken", () => {
  it("returns a 64-char hex string", () => {
    const token = generateToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("generates unique tokens on each call", () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

describe("validateEmail", () => {
  it("accepts valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(validateEmail("notanemail")).toBe(false);
  });

  it("rejects null / undefined", () => {
    expect(validateEmail(null)).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts passwords 8–128 chars", () => {
    expect(validatePassword("password")).toBe(true);
  });

  it("rejects passwords shorter than 8 chars", () => {
    expect(validatePassword("short")).toBe(false);
  });

  it("rejects passwords over 128 chars", () => {
    expect(validatePassword("a".repeat(129))).toBe(false);
  });
});

describe("token TTLs", () => {
  it("access token TTL is 15 minutes", () => {
    expect(ACCESS_TOKEN_TTL).toBe(15 * 60 * 1000);
  });

  it("refresh token TTL is 30 days", () => {
    expect(REFRESH_TOKEN_TTL).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
