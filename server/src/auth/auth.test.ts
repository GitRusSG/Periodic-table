/**
 * Unit tests for Auth Service
 *
 * Covers:
 *  - Registration rejects duplicate username / email (Requirement 6.1)
 *  - Login returns generic error for bad username AND bad password (Requirement 6.5)
 *  - Refresh issues a new JWT from a valid refresh token (Requirement 6.2)
 *  - requireAuth middleware returns 401 on expired/invalid JWT (Requirement 6.6)
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { authStore } from "./authStore.js";

// Re-create the app for each test suite so the store is fresh.
const app = createApp();

// Helper: register a user and return the response.
async function registerUser(
  username: string,
  email: string,
  password: string
) {
  return request(app)
    .post("/api/auth/register")
    .send({ username, email, password });
}

// Helper: log in and return the response (includes Set-Cookie headers).
async function loginUser(username: string, password: string) {
  return request(app)
    .post("/api/auth/login")
    .send({ username, password });
}

// Reset the in-memory store before every test.
beforeEach(() => {
  authStore.clear();
});

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
describe("POST /api/auth/register", () => {
  it("creates a new account and returns 201 with a token cookie", async () => {
    const res = await registerUser("alice", "alice@example.com", "password123");

    expect(res.status).toBe(201);
    expect(res.body.username).toBe("alice");
    // Access token cookie should be set
    const cookies: string[] = res.headers["set-cookie"] ?? [];
    expect(cookies.some((c: string) => c.startsWith("token="))).toBe(true);
  });

  it("rejects registration with a duplicate username (case-insensitive)", async () => {
    await registerUser("alice", "alice@example.com", "password123");

    // Same username, different email
    const res = await registerUser("Alice", "other@example.com", "password123");

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username/i);
  });

  it("rejects registration with a duplicate email (case-insensitive)", async () => {
    await registerUser("alice", "alice@example.com", "password123");

    // Different username, same email
    const res = await registerUser("bob", "ALICE@EXAMPLE.COM", "password123");

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/i);
  });

  it("rejects registration with a missing password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "alice", email: "alice@example.com" });

    expect(res.status).toBe(400);
  });

  it("rejects registration with an invalid email", async () => {
    const res = await registerUser("alice", "not-an-email", "password123");
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    // Seed one user for login tests.
    await registerUser("alice", "alice@example.com", "correctpassword");
  });

  it("returns 200 with JWT and refresh token cookies on valid credentials", async () => {
    const res = await loginUser("alice", "correctpassword");

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("alice");

    const cookies: string[] = res.headers["set-cookie"] ?? [];
    expect(cookies.some((c: string) => c.startsWith("token="))).toBe(true);
    expect(cookies.some((c: string) => c.startsWith("refreshToken="))).toBe(true);
  });

  it("sets httpOnly and SameSite=Strict on both cookies", async () => {
    const res = await loginUser("alice", "correctpassword");
    const cookies: string[] = res.headers["set-cookie"] ?? [];

    for (const cookie of cookies) {
      if (cookie.startsWith("token=") || cookie.startsWith("refreshToken=")) {
        expect(cookie.toLowerCase()).toContain("httponly");
        expect(cookie.toLowerCase()).toContain("samesite=strict");
      }
    }
  });

  it("returns generic 'Invalid credentials' for a bad username — never reveals which field failed", async () => {
    const res = await loginUser("nonexistent", "correctpassword");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("returns generic 'Invalid credentials' for a bad password — never reveals which field failed", async () => {
    const res = await loginUser("alice", "wrongpassword");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("bad-username and bad-password responses are identical (no enumeration)", async () => {
    const badUsername = await loginUser("nonexistent", "correctpassword");
    const badPassword = await loginUser("alice", "wrongpassword");

    expect(badUsername.status).toBe(badPassword.status);
    expect(badUsername.body.error).toBe(badPassword.body.error);
  });
});

// ---------------------------------------------------------------------------
// Refresh
// ---------------------------------------------------------------------------
describe("POST /api/auth/refresh", () => {
  it("issues a new access JWT when a valid refresh token cookie is provided", async () => {
    // Log in to obtain a refresh token cookie.
    await registerUser("alice", "alice@example.com", "password123");
    const loginRes = await loginUser("alice", "password123");

    const cookies: string[] = loginRes.headers["set-cookie"] ?? [];
    const refreshCookie = cookies.find((c: string) =>
      c.startsWith("refreshToken=")
    );
    expect(refreshCookie).toBeDefined();

    // Use the refresh token to get a new access token.
    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshCookie!);

    expect(refreshRes.status).toBe(200);
    const newCookies: string[] = refreshRes.headers["set-cookie"] ?? [];
    expect(newCookies.some((c: string) => c.startsWith("token="))).toBe(true);
  });

  it("returns 401 when no refresh token cookie is present", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
  });

  it("returns 401 when the refresh token is tampered with", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", "refreshToken=this.is.not.valid");

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// requireAuth middleware (session expiry — Requirement 6.6)
// ---------------------------------------------------------------------------
describe("requireAuth middleware", () => {
  it("returns 401 with { error: 'Session expired' } when no token is provided", async () => {
    const res = await request(app).get("/api/protected");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Session expired");
  });

  it("returns 401 with { error: 'Session expired' } for a malformed token", async () => {
    const res = await request(app)
      .get("/api/protected")
      .set("Cookie", "token=not.a.valid.jwt");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Session expired");
  });

  it("allows access when a valid token is provided", async () => {
    await registerUser("alice", "alice@example.com", "password123");
    const loginRes = await loginUser("alice", "password123");

    const cookies: string[] = loginRes.headers["set-cookie"] ?? [];
    const tokenCookie = cookies.find((c: string) => c.startsWith("token="));
    expect(tokenCookie).toBeDefined();

    const res = await request(app)
      .get("/api/protected")
      .set("Cookie", tokenCookie!);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("alice");
  });
});
