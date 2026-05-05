/**
 * Unit tests for Progression Service
 *
 * Covers:
 *  - GET /api/progress returns default state for a new user (Requirement 6.3, 6.4)
 *  - PUT /api/progress merges partial updates without overwriting unrelated fields (Requirement 6.3)
 *  - POST /api/progress/mastery awards a Name_Tag on first defeat (Requirement 10.1)
 *  - POST /api/progress/mastery is idempotent — second call for same element does not award a second Name_Tag (Requirement 10.1)
 *  - Leaderboard is updated when XP changes via PUT /api/progress (Requirements 5.1, 5.4)
 *  - Unauthenticated requests are rejected with 401 (Requirement 6.6)
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { authStore } from "../auth/authStore.js";
import { progressionStore, leaderboardEmitter, LeaderboardUpdateEvent } from "./progressionStore.js";

const app = createApp();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function registerAndLogin(
  username: string,
  email: string,
  password: string
): Promise<string> {
  await request(app)
    .post("/api/auth/register")
    .send({ username, email, password });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ username, password });

  const cookies: string[] = loginRes.headers["set-cookie"] ?? [];
  const tokenCookie = cookies.find((c: string) => c.startsWith("token="));
  if (!tokenCookie) throw new Error("No token cookie after login");
  return tokenCookie;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  authStore.clear();
  progressionStore.clear();
});

// ---------------------------------------------------------------------------
// Authentication guard
// ---------------------------------------------------------------------------

describe("Progression routes — authentication guard", () => {
  it("GET /api/progress returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/progress");
    expect(res.status).toBe(401);
  });

  it("PUT /api/progress returns 401 when not authenticated", async () => {
    const res = await request(app).put("/api/progress").send({});
    expect(res.status).toBe(401);
  });

  it("POST /api/progress/mastery returns 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/progress/mastery")
      .send({ atomicNumber: 1, name: "Hydrogen", symbol: "H" });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/progress
// ---------------------------------------------------------------------------

describe("GET /api/progress", () => {
  it("returns default ProgressionState for a new user", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    const res = await request(app)
      .get("/api/progress")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      xpByDifficulty: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      unlockedDifficulties: [1],
      masteredElements: [],
      nameTags: [],
      equippedNameTag: null,
      inventory: [],
    });
  });

  it("returns the same state on subsequent calls (idempotent read)", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    const res1 = await request(app).get("/api/progress").set("Cookie", cookie);
    const res2 = await request(app).get("/api/progress").set("Cookie", cookie);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body).toEqual(res2.body);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/progress — partial merge (Requirement 6.3)
// ---------------------------------------------------------------------------

describe("PUT /api/progress — partial merge", () => {
  it("merges xpByDifficulty without overwriting unrelated difficulty XP", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    // Set XP for difficulty 1 and 2.
    await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ xpByDifficulty: { 1: 100, 2: 50 } });

    // Update only difficulty 1 — difficulty 2 must remain 50.
    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ xpByDifficulty: { 1: 200 } });

    expect(res.status).toBe(200);
    expect(res.body.xpByDifficulty["1"]).toBe(200);
    expect(res.body.xpByDifficulty["2"]).toBe(50);
  });

  it("merges unlockedDifficulties without overwriting other fields", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    // First set some XP.
    await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ xpByDifficulty: { 1: 500 } });

    // Then update only unlockedDifficulties.
    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ unlockedDifficulties: [1, 2] });

    expect(res.status).toBe(200);
    expect(res.body.unlockedDifficulties).toEqual([1, 2]);
    // XP should be preserved.
    expect(res.body.xpByDifficulty["1"]).toBe(500);
  });

  it("merges equippedNameTag without overwriting masteredElements", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    // Set masteredElements first.
    await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ masteredElements: [1, 8, 26] });

    // Update only equippedNameTag.
    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ equippedNameTag: 26 });

    expect(res.status).toBe(200);
    expect(res.body.equippedNameTag).toBe(26);
    // masteredElements must be unchanged.
    expect(res.body.masteredElements).toEqual([1, 8, 26]);
  });

  it("returns 400 when body is a JSON array (not an object)", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    const res = await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .set("Content-Type", "application/json")
      .send(JSON.stringify([1, 2, 3]));

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/progress/mastery — idempotency (Requirement 10.1)
// ---------------------------------------------------------------------------

describe("POST /api/progress/mastery", () => {
  it("awards a Name_Tag on first defeat and returns awarded: true", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    const res = await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 1, name: "Hydrogen", symbol: "H" });

    expect(res.status).toBe(200);
    expect(res.body.awarded).toBe(true);
    expect(res.body.nameTag).toMatchObject({
      atomicNumber: 1,
      name: "Hydrogen",
      symbol: "H",
    });
  });

  it("is idempotent — second call for same element returns awarded: false and does not add a duplicate Name_Tag", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    // First call.
    await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 1, name: "Hydrogen", symbol: "H" });

    // Second call for the same element.
    const res = await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 1, name: "Hydrogen", symbol: "H" });

    expect(res.status).toBe(200);
    expect(res.body.awarded).toBe(false);

    // Verify the state has exactly one Name_Tag for this element.
    const stateRes = await request(app)
      .get("/api/progress")
      .set("Cookie", cookie);

    const nameTags = stateRes.body.nameTags as Array<{ atomicNumber: number }>;
    const tagsForElement = nameTags.filter((t) => t.atomicNumber === 1);
    expect(tagsForElement).toHaveLength(1);
  });

  it("records the element in masteredElements after first defeat", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 26, name: "Iron", symbol: "Fe" });

    const stateRes = await request(app)
      .get("/api/progress")
      .set("Cookie", cookie);

    expect(stateRes.body.masteredElements).toContain(26);
  });

  it("allows mastery of different elements independently", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 1, name: "Hydrogen", symbol: "H" });

    await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 8, name: "Oxygen", symbol: "O" });

    const stateRes = await request(app)
      .get("/api/progress")
      .set("Cookie", cookie);

    expect(stateRes.body.masteredElements).toContain(1);
    expect(stateRes.body.masteredElements).toContain(8);
    expect(stateRes.body.nameTags).toHaveLength(2);
  });

  it("returns 400 for an invalid atomicNumber", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    const res = await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 999, name: "Fake", symbol: "Fk" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    const res = await request(app)
      .post("/api/progress/mastery")
      .set("Cookie", cookie)
      .send({ atomicNumber: 1, symbol: "H" });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Leaderboard update on XP change (Requirements 5.1, 5.4)
// ---------------------------------------------------------------------------

describe("Leaderboard update via PUT /api/progress", () => {
  it("emits a leaderboard:update event when xpByDifficulty changes", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    const events: LeaderboardUpdateEvent[] = [];
    leaderboardEmitter.once("leaderboard:update", (e: LeaderboardUpdateEvent) => {
      events.push(e);
    });

    await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ xpByDifficulty: { 1: 150 } });

    expect(events).toHaveLength(1);
    expect(events[0].difficultyLevel).toBe(1);
    expect(events[0].xp).toBe(150);
  });

  it("updates the in-memory leaderboard with the new XP value", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ xpByDifficulty: { 2: 300 } });

    const leaderboard = progressionStore.getLeaderboard(2);
    expect(leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard[0].xp).toBe(300);
  });

  it("leaderboard is sorted descending by XP across multiple users", async () => {
    const cookieA = await registerAndLogin("alice", "alice@example.com", "password123");
    const cookieB = await registerAndLogin("bob", "bob@example.com", "password456");

    await request(app)
      .put("/api/progress")
      .set("Cookie", cookieA)
      .send({ xpByDifficulty: { 1: 100 } });

    await request(app)
      .put("/api/progress")
      .set("Cookie", cookieB)
      .send({ xpByDifficulty: { 1: 500 } });

    const leaderboard = progressionStore.getLeaderboard(1);
    expect(leaderboard[0].xp).toBeGreaterThanOrEqual(leaderboard[1].xp);
  });

  it("does not emit a leaderboard event when xpByDifficulty is not in the update", async () => {
    const cookie = await registerAndLogin("alice", "alice@example.com", "password123");

    let eventFired = false;
    leaderboardEmitter.once("leaderboard:update", () => {
      eventFired = true;
    });

    await request(app)
      .put("/api/progress")
      .set("Cookie", cookie)
      .send({ equippedNameTag: 26 });

    // Give the event loop a tick to fire any pending events.
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(eventFired).toBe(false);
  });
});
