/**
 * Trivia router — mounts all /api/trivia/* endpoints.
 *
 * GET  /api/trivia/questions  — returns a signed batch of questions (public)
 * POST /api/trivia/answers    — validates token, evaluates answer, awards XP (auth required)
 *
 * Requirements: 4.1, 4.2, 4.3
 */

import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { questionStore } from "./questionStore.js";
import {
  signQuestionToken,
  verifyQuestionToken,
} from "./triviaTokenService.js";
import {
  progressionStore,
  DifficultyLevel,
} from "../progression/progressionStore.js";

export const triviaRouter = Router();

// ---------------------------------------------------------------------------
// GET /api/trivia/questions
//
// Query params:
//   difficulty  — integer 1–5 (required)
//   count       — number of questions to return (optional, default 10, max 20)
//
// Returns an array of signed question objects (correctIndex is NOT included in
// the response — only the opaque token encodes it).
//
// This endpoint is intentionally public (no auth required).
// Requirements: 4.1, 4.2
// ---------------------------------------------------------------------------
triviaRouter.get("/questions", (req: Request, res: Response) => {
  const rawDifficulty = req.query.difficulty;
  const rawCount = req.query.count;

  // --- Validate difficulty ---
  const difficulty = Number(rawDifficulty);
  if (
    !Number.isInteger(difficulty) ||
    difficulty < 1 ||
    difficulty > 5
  ) {
    res
      .status(400)
      .json({ error: "difficulty must be an integer between 1 and 5" });
    return;
  }

  // --- Validate count ---
  const count = rawCount !== undefined ? Number(rawCount) : 10;
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    res
      .status(400)
      .json({ error: "count must be an integer between 1 and 20" });
    return;
  }

  const questions = questionStore.getQuestions(
    difficulty as DifficultyLevel,
    count
  );

  // Sign each question and strip the correctIndex from the response.
  const signedQuestions = questions.map((q) => {
    const token = signQuestionToken({
      questionId: q.id,
      correctIndex: q.correctIndex,
      difficultyLevel: q.difficultyLevel,
    });

    return {
      id: q.id,
      text: q.text,
      options: q.options,
      difficultyLevel: q.difficultyLevel,
      token,
      // correctIndex is intentionally omitted from the response
    };
  });

  res.status(200).json({ questions: signedQuestions });
});

// ---------------------------------------------------------------------------
// POST /api/trivia/answers
//
// Body:
//   questionToken      — signed token returned by GET /api/trivia/questions
//   answer             — integer 0–3 (the index the user selected)
//   responseTimeSeconds — elapsed time in seconds (used for time bonus)
//
// Returns:
//   { correct: boolean, xpAwarded: number, newTotal: number }
//
// This endpoint requires authentication.
// Requirements: 4.3
// ---------------------------------------------------------------------------
triviaRouter.post("/answers", requireAuth, (req: Request, res: Response) => {
  const { questionToken, answer, responseTimeSeconds } = req.body as {
    questionToken?: unknown;
    answer?: unknown;
    responseTimeSeconds?: unknown;
  };

  // --- Validate inputs ---
  if (typeof questionToken !== "string" || questionToken.trim().length === 0) {
    res.status(400).json({ error: "questionToken is required" });
    return;
  }

  if (
    typeof answer !== "number" ||
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer > 3
  ) {
    res
      .status(400)
      .json({ error: "answer must be an integer between 0 and 3" });
    return;
  }

  const responseTime =
    typeof responseTimeSeconds === "number" && responseTimeSeconds >= 0
      ? responseTimeSeconds
      : 30; // default to max time (no bonus) if not provided

  // --- Verify HMAC token ---
  let tokenPayload: ReturnType<typeof verifyQuestionToken>;
  try {
    tokenPayload = verifyQuestionToken(questionToken);
  } catch {
    res.status(400).json({ error: "Invalid or tampered question token" });
    return;
  }

  // --- Evaluate answer ---
  const correct = answer === tokenPayload.correctIndex;

  // --- Compute XP ---
  // baseXP = difficultyLevel × 10
  // timeBonus = max(0, (30 - responseTimeSeconds) / 30) × baseXP
  // totalXP = baseXP + timeBonus  (only awarded for correct answers)
  let xpAwarded = 0;
  if (correct) {
    const difficultyLevel = tokenPayload.difficultyLevel;
    const baseXP = difficultyLevel * 10;
    const timeBonus =
      Math.max(0, (30 - responseTime) / 30) * baseXP;
    xpAwarded = Math.round(baseXP + timeBonus);
  }

  // --- Update progression store ---
  const userId = req.user!.sub;
  const difficultyLevel = tokenPayload.difficultyLevel;

  let newTotal = 0;
  if (xpAwarded > 0) {
    const currentState = progressionStore.getState(userId);
    const currentXP = currentState.xpByDifficulty[difficultyLevel] ?? 0;
    const updatedXP = currentXP + xpAwarded;

    progressionStore.mergeState(userId, {
      xpByDifficulty: { [difficultyLevel]: updatedXP } as Record<
        DifficultyLevel,
        number
      >,
    });

    newTotal = updatedXP;
  } else {
    const currentState = progressionStore.getState(userId);
    newTotal = currentState.xpByDifficulty[difficultyLevel] ?? 0;
  }

  res.status(200).json({ correct, xpAwarded, newTotal });
});
