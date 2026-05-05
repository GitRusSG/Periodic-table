/**
 * Unit tests for Trivia Engine
 *
 * Covers:
 *  - GET /api/trivia/questions returns signed questions for a valid difficulty (Requirements 4.1, 4.2)
 *  - GET /api/trivia/questions rejects invalid difficulty / count params
 *  - HMAC token validation rejects tampered tokens (Requirement 4.3)
 *  - POST /api/trivia/answers evaluates correct and incorrect answers (Requirement 4.3)
 *  - XP formula: correct answer at difficulty 3 with 10s response time yields 50 XP (Requirement 4.3)
 *    baseXP = 3 × 10 = 30
 *    timeBonus = max(0, (30 - 10) / 30) × 30 = (20/30) × 30 = 20
 *    totalXP = 30 + 20 = 50
 *  - POST /api/trivia/answers requires authentication
 *  - XP accumulates correctly across multiple correct answers
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { authStore } from "../auth/authStore.js";
import { progressionStore } from "../progression/progressionStore.js";
import {
  signQuestionToken,
  verifyQuestionToken,
} from "./triviaTokenService.js";

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
// GET /api/trivia/questions
// ---------------------------------------------------------------------------

describe("GET /api/trivia/questions", () => {
  it("returns a batch of signed questions for a valid difficulty", async () => {
    const res = await request(app).get(
      "/api/trivia/questions?difficulty=1&count=3"
    );

    expect(res.status).toBe(200);
    expect(res.body.questions).toHaveLength(3);

    for (const q of res.body.questions) {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("text");
      expect(q).toHaveProperty("options");
      expect(q.options).toHaveLength(4);
      expect(q).toHaveProperty("difficultyLevel", 1);
      expect(q).toHaveProperty("token");
      // correctIndex must NOT be exposed in the response
      expect(q).not.toHaveProperty("correctIndex");
    }
  });

  it("returns questions matching the requested difficulty level", async () => {
    for (const difficulty of [1, 2, 3, 4, 5] as const) {
      const res = await request(app).get(
        `/api/trivia/questions?difficulty=${difficulty}&count=5`
      );
      expect(res.status).toBe(200);
      for (const q of res.body.questions) {
        expect(q.difficultyLevel).toBe(difficulty);
      }
    }
  });

  it("defaults to 10 questions when count is not specified", async () => {
    const res = await request(app).get("/api/trivia/questions?difficulty=1");
    expect(res.status).toBe(200);
    // We have 6 questions at difficulty 1, so it returns all available
    expect(res.body.questions.length).toBeGreaterThan(0);
    expect(res.body.questions.length).toBeLessThanOrEqual(10);
  });

  it("returns 400 when difficulty is missing", async () => {
    const res = await request(app).get("/api/trivia/questions?count=5");
    expect(res.status).toBe(400);
  });

  it("returns 400 when difficulty is out of range", async () => {
    const res = await request(app).get("/api/trivia/questions?difficulty=6");
    expect(res.status).toBe(400);
  });

  it("returns 400 when difficulty is 0", async () => {
    const res = await request(app).get("/api/trivia/questions?difficulty=0");
    expect(res.status).toBe(400);
  });

  it("returns 400 when count exceeds 20", async () => {
    const res = await request(app).get(
      "/api/trivia/questions?difficulty=1&count=25"
    );
    expect(res.status).toBe(400);
  });

  it("each returned token can be verified and decodes to the correct question data", async () => {
    const res = await request(app).get(
      "/api/trivia/questions?difficulty=2&count=3"
    );
    expect(res.status).toBe(200);

    for (const q of res.body.questions) {
      const payload = verifyQuestionToken(q.token);
      expect(payload.questionId).toBe(q.id);
      expect(payload.difficultyLevel).toBe(q.difficultyLevel);
      // correctIndex is encoded in the token but not in the response
      expect(payload.correctIndex).toBeGreaterThanOrEqual(0);
      expect(payload.correctIndex).toBeLessThanOrEqual(3);
    }
  });
});

// ---------------------------------------------------------------------------
// HMAC token validation — tamper detection (Requirement 4.3)
// ---------------------------------------------------------------------------

describe("HMAC token validation", () => {
  it("verifyQuestionToken accepts a valid token", () => {
    const token = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    const payload = verifyQuestionToken(token);
    expect(payload.questionId).toBe("d1-q1");
    expect(payload.correctIndex).toBe(2);
    expect(payload.difficultyLevel).toBe(1);
  });

  it("verifyQuestionToken rejects a token with a tampered correctIndex", () => {
    const token = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    // Decode, mutate correctIndex, re-encode without re-signing
    const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    decoded.correctIndex = 0; // tamper: change the correct answer
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString(
      "base64url"
    );

    expect(() => verifyQuestionToken(tamperedToken)).toThrow("Invalid token");
  });

  it("verifyQuestionToken rejects a token with a tampered questionId", () => {
    const token = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    decoded.questionId = "d1-q99"; // tamper: change the question id
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString(
      "base64url"
    );

    expect(() => verifyQuestionToken(tamperedToken)).toThrow("Invalid token");
  });

  it("verifyQuestionToken rejects a token with a tampered difficultyLevel", () => {
    const token = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    const decoded = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    decoded.difficultyLevel = 5; // tamper: inflate difficulty for more XP
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString(
      "base64url"
    );

    expect(() => verifyQuestionToken(tamperedToken)).toThrow("Invalid token");
  });

  it("verifyQuestionToken rejects a completely invalid token string", () => {
    expect(() => verifyQuestionToken("not-a-valid-token")).toThrow(
      "Invalid token"
    );
  });

  it("verifyQuestionToken rejects an empty string", () => {
    expect(() => verifyQuestionToken("")).toThrow("Invalid token");
  });

  it("POST /api/trivia/answers returns 400 for a tampered token", async () => {
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    // Get a real token
    const questionsRes = await request(app).get(
      "/api/trivia/questions?difficulty=1&count=1"
    );
    const realToken: string = questionsRes.body.questions[0].token;

    // Tamper with the token
    const decoded = JSON.parse(
      Buffer.from(realToken, "base64url").toString("utf8")
    );
    decoded.correctIndex = (decoded.correctIndex + 1) % 4; // change answer
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString(
      "base64url"
    );

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({
        questionToken: tamperedToken,
        answer: decoded.correctIndex,
        responseTimeSeconds: 10,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tampered|invalid/i);
  });
});

// ---------------------------------------------------------------------------
// POST /api/trivia/answers — XP formula (Requirement 4.3)
// ---------------------------------------------------------------------------

describe("POST /api/trivia/answers", () => {
  it("requires authentication — returns 401 without a token", async () => {
    const token = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    const res = await request(app)
      .post("/api/trivia/answers")
      .send({ questionToken: token, answer: 2, responseTimeSeconds: 5 });

    expect(res.status).toBe(401);
  });

  it("awards 0 XP for an incorrect answer", async () => {
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    // Create a token where correctIndex = 2
    const questionToken = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({
        questionToken,
        answer: 0, // wrong answer
        responseTimeSeconds: 5,
      });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(false);
    expect(res.body.xpAwarded).toBe(0);
    expect(res.body.newTotal).toBe(0);
  });

  it("XP formula: difficulty 3, 10s response time → 50 XP", async () => {
    // baseXP = 3 × 10 = 30
    // timeBonus = max(0, (30 - 10) / 30) × 30 = (20/30) × 30 = 20
    // totalXP = 30 + 20 = 50
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    const questionToken = signQuestionToken({
      questionId: "d3-q1",
      correctIndex: 1,
      difficultyLevel: 3,
    });

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({
        questionToken,
        answer: 1, // correct answer
        responseTimeSeconds: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.xpAwarded).toBe(50);
    expect(res.body.newTotal).toBe(50);
  });

  it("XP formula: difficulty 1, 0s response time → 20 XP (max bonus)", async () => {
    // baseXP = 1 × 10 = 10
    // timeBonus = max(0, (30 - 0) / 30) × 10 = 1.0 × 10 = 10
    // totalXP = 10 + 10 = 20
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    const questionToken = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({
        questionToken,
        answer: 2,
        responseTimeSeconds: 0,
      });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.xpAwarded).toBe(20);
  });

  it("XP formula: difficulty 5, 30s response time → 50 XP (no time bonus)", async () => {
    // baseXP = 5 × 10 = 50
    // timeBonus = max(0, (30 - 30) / 30) × 50 = 0
    // totalXP = 50 + 0 = 50
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    const questionToken = signQuestionToken({
      questionId: "d5-q1",
      correctIndex: 2,
      difficultyLevel: 5,
    });

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({
        questionToken,
        answer: 2,
        responseTimeSeconds: 30,
      });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.xpAwarded).toBe(50);
  });

  it("XP formula: time bonus is clamped to 0 when response time exceeds 30s", async () => {
    // baseXP = 2 × 10 = 20
    // timeBonus = max(0, (30 - 45) / 30) × 20 = max(0, -0.5) × 20 = 0
    // totalXP = 20 + 0 = 20
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    const questionToken = signQuestionToken({
      questionId: "d2-q1",
      correctIndex: 3,
      difficultyLevel: 2,
    });

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({
        questionToken,
        answer: 3,
        responseTimeSeconds: 45,
      });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.xpAwarded).toBe(20);
  });

  it("XP accumulates correctly across multiple correct answers", async () => {
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    // First answer: difficulty 1, 0s → 20 XP
    const token1 = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });
    const res1 = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({ questionToken: token1, answer: 2, responseTimeSeconds: 0 });

    expect(res1.body.xpAwarded).toBe(20);
    expect(res1.body.newTotal).toBe(20);

    // Second answer: difficulty 1, 30s → 10 XP (no bonus)
    const token2 = signQuestionToken({
      questionId: "d1-q2",
      correctIndex: 2,
      difficultyLevel: 1,
    });
    const res2 = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({ questionToken: token2, answer: 2, responseTimeSeconds: 30 });

    expect(res2.body.xpAwarded).toBe(10);
    expect(res2.body.newTotal).toBe(30);
  });

  it("returns 400 when questionToken is missing", async () => {
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({ answer: 2, responseTimeSeconds: 10 });

    expect(res.status).toBe(400);
  });

  it("returns 400 when answer is out of range", async () => {
    const cookie = await registerAndLogin(
      "alice",
      "alice@example.com",
      "password123"
    );

    const token = signQuestionToken({
      questionId: "d1-q1",
      correctIndex: 2,
      difficultyLevel: 1,
    });

    const res = await request(app)
      .post("/api/trivia/answers")
      .set("Cookie", cookie)
      .send({ questionToken: token, answer: 5, responseTimeSeconds: 10 });

    expect(res.status).toBe(400);
  });
});
