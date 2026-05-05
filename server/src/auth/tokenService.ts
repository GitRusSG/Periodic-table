/**
 * Token service — issues and verifies JWTs and refresh tokens.
 *
 * Environment variables:
 *   JWT_SECRET        — secret for signing access JWTs (default: "dev-jwt-secret")
 *   REFRESH_SECRET    — secret for signing refresh tokens (default: "dev-refresh-secret")
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-jwt-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET ?? "dev-refresh-secret";

export const JWT_EXPIRY = "24h";
export const REFRESH_EXPIRY = "30d";

export interface JwtPayload {
  sub: string;   // user id
  username: string;
}

/**
 * Issues a short-lived access JWT (24 h).
 */
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Issues a long-lived refresh token (30 d).
 */
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

/**
 * Verifies an access JWT and returns its payload.
 * Throws a JsonWebTokenError or TokenExpiredError on failure.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Verifies a refresh token and returns its payload.
 * Throws a JsonWebTokenError or TokenExpiredError on failure.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
