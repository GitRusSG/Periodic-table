/**
 * Game router — mounts all /api/game/* endpoints.
 *
 * POST /api/game/encounter/start    — validate element + difficulty, issue encounterId + seed
 * POST /api/game/encounter/complete — record outcome; on victory recompute loot and persist
 *
 * All routes require authentication.
 *
 * Requirements: 8.1, 8.4, 9.1, 10.1
 */

import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { requireAuth } from "../middleware/requireAuth.js";
import { encounterStore } from "./encounterStore.js";
import { recomputeLoot, LootItem } from "./lootEngine.js";
import {
  progressionStore,
  InventoryItem,
  NameTag,
} from "../progression/progressionStore.js";

export const gameRouter = Router();

// All game routes require authentication.
gameRouter.use(requireAuth);

// ---------------------------------------------------------------------------
// POST /api/game/encounter/start
//
// Body:
//   elementAtomicNumber  — integer 1–118
//   difficultyLevel      — integer 1–5
//
// Returns:
//   { encounterId: string (UUID), seed: number (32-bit unsigned int) }
//
// Requirements: 8.1
// ---------------------------------------------------------------------------
gameRouter.post("/encounter/start", (req: Request, res: Response) => {
  const { elementAtomicNumber, difficultyLevel } = req.body as {
    elementAtomicNumber?: unknown;
    difficultyLevel?: unknown;
  };

  // --- Validate elementAtomicNumber ---
  if (
    typeof elementAtomicNumber !== "number" ||
    !Number.isInteger(elementAtomicNumber) ||
    elementAtomicNumber < 1 ||
    elementAtomicNumber > 118
  ) {
    res
      .status(400)
      .json({ error: "elementAtomicNumber must be an integer between 1 and 118" });
    return;
  }

  // --- Validate difficultyLevel ---
  if (
    typeof difficultyLevel !== "number" ||
    !Number.isInteger(difficultyLevel) ||
    difficultyLevel < 1 ||
    difficultyLevel > 5
  ) {
    res
      .status(400)
      .json({ error: "difficultyLevel must be an integer between 1 and 5" });
    return;
  }

  // --- Generate encounter ---
  const encounterId = randomUUID();

  // Generate a random 32-bit unsigned integer seed.
  // Math.random() * 2^32 gives a value in [0, 2^32); >>> 0 coerces to uint32.
  const seed = (Math.random() * 0x100000000) >>> 0;

  const userId = req.user!.sub;

  encounterStore.create({
    encounterId,
    userId,
    elementAtomicNumber,
    difficultyLevel,
    seed,
    createdAt: Date.now(),
    completed: false,
    outcome: null,
  });

  res.status(200).json({ encounterId, seed });
});

// ---------------------------------------------------------------------------
// POST /api/game/encounter/complete
//
// Body:
//   encounterId  — UUID returned by /encounter/start
//   outcome      — "victory" | "defeat"
//
// On victory:
//   - Recompute loot deterministically using stored seed
//   - Persist loot items to progression inventory
//   - Award Name_Tag if first defeat (calls progressionStore.recordMastery)
//   - Return { loot, nameTags, xpAwarded }
//
// On defeat:
//   - Record encounter outcome, no loot or XP change
//   - Return { outcome: "defeat" }
//
// Requirements: 8.4, 9.1, 10.1
// ---------------------------------------------------------------------------
gameRouter.post("/encounter/complete", (req: Request, res: Response) => {
  const { encounterId, outcome } = req.body as {
    encounterId?: unknown;
    outcome?: unknown;
  };

  // --- Validate encounterId ---
  if (typeof encounterId !== "string" || encounterId.trim().length === 0) {
    res.status(400).json({ error: "encounterId is required" });
    return;
  }

  // --- Validate outcome ---
  if (outcome !== "victory" && outcome !== "defeat") {
    res
      .status(400)
      .json({ error: 'outcome must be "victory" or "defeat"' });
    return;
  }

  // --- Look up encounter ---
  const encounter = encounterStore.get(encounterId.trim());
  if (!encounter) {
    res.status(404).json({ error: "Encounter not found" });
    return;
  }

  // --- Ownership check ---
  const userId = req.user!.sub;
  if (encounter.userId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // --- Prevent double-completion ---
  if (encounter.completed) {
    res.status(409).json({ error: "Encounter already completed" });
    return;
  }

  // --- Mark encounter as completed ---
  encounterStore.complete(encounterId.trim(), outcome);

  // --- Handle defeat ---
  if (outcome === "defeat") {
    res.status(200).json({ outcome: "defeat" });
    return;
  }

  // --- Handle victory ---

  // 1. Recompute loot deterministically using the stored seed.
  const loot: LootItem[] = recomputeLoot(
    encounter.seed,
    encounter.elementAtomicNumber,
    encounter.difficultyLevel
  );

  // 2. Persist loot items to the user's inventory.
  const inventoryItems: InventoryItem[] = loot.map((item, idx) => ({
    id: `${encounterId}-loot-${idx}`,
    name: item.name,
    atomicNumber: item.sourceElementAtomicNumber,
    rarity: item.rarity,
    stats: {},
  }));

  const currentState = progressionStore.getState(userId);
  progressionStore.mergeState(userId, {
    inventory: [...currentState.inventory, ...inventoryItems],
  });

  // 3. Award XP based on difficulty level (base XP = difficultyLevel × 10).
  const xpAwarded = encounter.difficultyLevel * 10;
  const currentXP =
    progressionStore.getState(userId).xpByDifficulty[
      encounter.difficultyLevel as 1 | 2 | 3 | 4 | 5
    ] ?? 0;
  progressionStore.mergeState(userId, {
    xpByDifficulty: {
      [encounter.difficultyLevel]: currentXP + xpAwarded,
    } as Record<1 | 2 | 3 | 4 | 5, number>,
  });

  // 4. Award Name_Tag if this is the first defeat of this element.
  //    We use a placeholder name/symbol since the server doesn't bundle
  //    the full elements.json — the client provides the canonical data
  //    via /api/progress/mastery. Here we record mastery with a minimal
  //    tag so the idempotency guard works correctly.
  const masteryResult = progressionStore.recordMastery(
    userId,
    encounter.elementAtomicNumber,
    {
      name: `Element-${encounter.elementAtomicNumber}`,
      symbol: `E${encounter.elementAtomicNumber}`,
    }
  );

  const nameTags: NameTag[] = masteryResult.awarded
    ? [masteryResult.nameTag]
    : [];

  res.status(200).json({ loot, nameTags, xpAwarded });
});
