/**
 * Progression router — mounts all /api/progress/* endpoints.
 *
 * GET  /api/progress          — returns full ProgressionState (auth required)
 * PUT  /api/progress          — partial merge update (auth required)
 * POST /api/progress/mastery  — record first-defeat, award Name_Tag (auth required)
 *
 * Requirements: 6.3, 6.4, 10.1, 5.1, 5.4
 */

import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  progressionStore,
  PartialProgressionState,
  NameTag,
} from "./progressionStore.js";

export const progressionRouter = Router();

// All progression routes require authentication.
progressionRouter.use(requireAuth);

// ---------------------------------------------------------------------------
// GET /api/progress
// Returns the full ProgressionState for the authenticated user.
// Requirements: 6.3, 6.4
// ---------------------------------------------------------------------------
progressionRouter.get("/", (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const state = progressionStore.getState(userId);
  res.status(200).json(state);
});

// ---------------------------------------------------------------------------
// PUT /api/progress
// Accepts a partial ProgressionState and merges it server-side.
// Last-write-wins per field.
// Requirements: 6.3, 6.4
// ---------------------------------------------------------------------------
progressionRouter.put("/", (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const partial = req.body as PartialProgressionState;

  if (!partial || typeof partial !== "object" || Array.isArray(partial)) {
    res.status(400).json({ error: "Request body must be a JSON object" });
    return;
  }

  const updated = progressionStore.mergeState(userId, partial);
  res.status(200).json(updated);
});

// ---------------------------------------------------------------------------
// POST /api/progress/mastery
// Records first-defeat of an element and awards a Name_Tag.
// Idempotent: second call for the same element returns the existing tag.
// Requirements: 10.1
// ---------------------------------------------------------------------------
progressionRouter.post("/mastery", (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { atomicNumber, name, symbol } = req.body as {
    atomicNumber?: unknown;
    name?: unknown;
    symbol?: unknown;
  };

  // --- Input validation ---
  if (
    typeof atomicNumber !== "number" ||
    !Number.isInteger(atomicNumber) ||
    atomicNumber < 1 ||
    atomicNumber > 118
  ) {
    res
      .status(400)
      .json({ error: "atomicNumber must be an integer between 1 and 118" });
    return;
  }
  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  if (typeof symbol !== "string" || symbol.trim().length === 0) {
    res.status(400).json({ error: "symbol is required" });
    return;
  }

  const nameTagData: Omit<NameTag, "atomicNumber"> = {
    name: name.trim(),
    symbol: symbol.trim(),
  };

  const result = progressionStore.recordMastery(
    userId,
    atomicNumber,
    nameTagData
  );

  res.status(200).json({
    awarded: result.awarded,
    nameTag: result.nameTag,
  });
});
