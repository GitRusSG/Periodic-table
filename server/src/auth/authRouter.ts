/**
 * Auth router — mounts all /api/auth/* endpoints.
 *
 * POST /api/auth/register  — create account, return access JWT in cookie
 * POST /api/auth/login     — validate credentials, set JWT + refresh cookies
 * POST /api/auth/refresh   — exchange refresh cookie for new access JWT
 */

import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { authStore } from "./authStore.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./tokenService.js";

export const authRouter = Router();

const BCRYPT_COST = 12;

/** Cookie options shared by both tokens. */
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
authRouter.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  // --- Input validation ---
  if (!username || typeof username !== "string" || username.trim().length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  // --- Uniqueness checks ---
  if (authStore.hasUsername(username)) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }
  if (authStore.hasEmail(email)) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  // --- Persist user ---
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = authStore.createUser({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
  });

  // --- Issue tokens ---
  const payload = { sub: user.id, username: user.username };
  const accessToken = signAccessToken(payload);

  res.cookie("token", accessToken, BASE_COOKIE_OPTIONS);
  res.status(201).json({ message: "Account created", username: user.username });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
authRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const user = authStore.findByUsername(username);

  // Constant-time comparison: always run bcrypt even when user not found
  // to prevent timing-based username enumeration.
  const DUMMY_HASH =
    "$2b$12$invalidhashpaddingtomatchbcryptlength000000000000000000000";
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatch) {
    // Requirement 6.5: never distinguish username vs. password failure
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload = { sub: user.id, username: user.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie("token", accessToken, BASE_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  });

  res.status(200).json({ message: "Login successful", username: user.username });
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------
authRouter.post("/refresh", (req: Request, res: Response) => {
  const refreshToken: string | undefined = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: "No refresh token provided" });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({
      sub: payload.sub,
      username: payload.username,
    });

    res.cookie("token", newAccessToken, BASE_COOKIE_OPTIONS);
    res.status(200).json({ message: "Token refreshed" });
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});
