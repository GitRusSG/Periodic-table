/**
 * Trivia HMAC Token Service.
 *
 * Signs and verifies question tokens used to prevent client-side answer tampering.
 *
 * Token format (base64url-encoded JSON):
 *   { questionId, correctIndex, difficultyLevel, sig }
 *
 * The HMAC signature covers: `${questionId}:${correctIndex}:${difficultyLevel}`
 *
 * Environment variable:
 *   HMAC_SECRET — secret key for HMAC-SHA256 (default: "dev-hmac-secret")
 *
 * Requirements: 4.2, 4.3
 */

import { createHmac } from "crypto";

const HMAC_SECRET = process.env.HMAC_SECRET ?? "dev-hmac-secret";

export interface QuestionTokenPayload {
  questionId: string;
  correctIndex: 0 | 1 | 2 | 3;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Computes the HMAC-SHA256 signature for the given payload fields.
 */
function computeSignature(
  questionId: string,
  correctIndex: number,
  difficultyLevel: number
): string {
  return createHmac("sha256", HMAC_SECRET)
    .update(`${questionId}:${correctIndex}:${difficultyLevel}`)
    .digest("hex");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a signed question token encoding questionId, correctIndex, and
 * difficultyLevel.  The token is a base64url-encoded JSON string.
 */
export function signQuestionToken(payload: QuestionTokenPayload): string {
  const sig = computeSignature(
    payload.questionId,
    payload.correctIndex,
    payload.difficultyLevel
  );

  const data = {
    questionId: payload.questionId,
    correctIndex: payload.correctIndex,
    difficultyLevel: payload.difficultyLevel,
    sig,
  };

  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

/**
 * Verifies a question token and returns its payload.
 *
 * Throws an error with message "Invalid token" if:
 *  - The token cannot be decoded / parsed
 *  - The HMAC signature does not match (tampered token)
 *
 * Requirements: 4.3
 */
export function verifyQuestionToken(token: string): QuestionTokenPayload {
  let data: {
    questionId?: unknown;
    correctIndex?: unknown;
    difficultyLevel?: unknown;
    sig?: unknown;
  };

  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    data = JSON.parse(json);
  } catch {
    throw new Error("Invalid token");
  }

  const { questionId, correctIndex, difficultyLevel, sig } = data;

  if (
    typeof questionId !== "string" ||
    typeof correctIndex !== "number" ||
    typeof difficultyLevel !== "number" ||
    typeof sig !== "string"
  ) {
    throw new Error("Invalid token");
  }

  const expectedSig = computeSignature(questionId, correctIndex, difficultyLevel);

  // Constant-time comparison to prevent timing attacks.
  if (sig.length !== expectedSig.length) {
    throw new Error("Invalid token");
  }

  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  if (diff !== 0) {
    throw new Error("Invalid token");
  }

  return {
    questionId,
    correctIndex: correctIndex as 0 | 1 | 2 | 3,
    difficultyLevel: difficultyLevel as 1 | 2 | 3 | 4 | 5,
  };
}
