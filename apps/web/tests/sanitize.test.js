import { describe, it, expect } from "vitest";
import {
  sanitizeText,
  sanitizeUrl,
  validateEmail,
  sanitizeName,
  validatePassword,
} from "../lib/sanitize.js";

describe("sanitizeText", () => {
  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("removes null bytes", () => {
    expect(sanitizeText("hel\0lo")).toBe("hello");
  });

  it("truncates at 10000 characters", () => {
    const long = "a".repeat(15000);
    expect(sanitizeText(long)).toHaveLength(10000);
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeText(null)).toBe("");
    expect(sanitizeText(123)).toBe("");
    expect(sanitizeText(undefined)).toBe("");
  });
});

describe("sanitizeUrl", () => {
  it("accepts valid http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("accepts valid https URLs", () => {
    expect(sanitizeUrl("https://example.com/path?q=1")).toBe("https://example.com/path?q=1");
  });

  it("rejects non-http URLs", () => {
    expect(sanitizeUrl("ftp://example.com")).toBe("");
    expect(sanitizeUrl("example.com")).toBe("");
  });

  it("rejects javascript: URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
  });

  it("rejects data: URLs", () => {
    expect(sanitizeUrl("data:text/html,<h1>hi</h1>")).toBe("");
  });

  it("truncates URLs longer than 2048 characters", () => {
    const long = "https://example.com/" + "a".repeat(3000);
    expect(sanitizeUrl(long)).toHaveLength(2048);
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeUrl(null)).toBe("");
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("user+tag@sub.domain.com")).toBe(true);
  });

  it("rejects emails without @", () => {
    expect(validateEmail("notanemail")).toBe(false);
  });

  it("rejects emails without domain", () => {
    expect(validateEmail("user@")).toBe(false);
  });

  it("rejects emails over 254 characters", () => {
    const long = "a".repeat(250) + "@b.com";
    expect(validateEmail(long)).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(123)).toBe(false);
  });
});

describe("sanitizeName", () => {
  it("trims whitespace", () => {
    expect(sanitizeName("  John  ")).toBe("John");
  });

  it("removes null bytes", () => {
    expect(sanitizeName("Jo\0hn")).toBe("John");
  });

  it("truncates at 100 characters", () => {
    const long = "a".repeat(200);
    expect(sanitizeName(long)).toHaveLength(100);
  });

  it("returns empty string for non-string input", () => {
    expect(sanitizeName(null)).toBe("");
  });
});

describe("validatePassword", () => {
  it("accepts passwords between 8 and 128 characters", () => {
    expect(validatePassword("password")).toBe(true);
    expect(validatePassword("a".repeat(128))).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("short")).toBe(false);
    expect(validatePassword("")).toBe(false);
  });

  it("rejects passwords longer than 128 characters", () => {
    expect(validatePassword("a".repeat(129))).toBe(false);
  });

  it("rejects non-string input", () => {
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword(12345678)).toBe(false);
  });
});
