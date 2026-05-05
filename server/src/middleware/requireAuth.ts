/**
 * requireAuth middleware — protects routes that require a valid JWT.
 *
 * Reads the JWT from the `token` httpOnly cookie (or Authorization header
 * as a fallback for API clients).
 *
 * On success: attaches `req.user` (JwtPayload) and calls next().
 * On expired/invalid token: returns 401 { error: "Session expired" }
 * per Requirement 6.6.
 */

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../auth/tokenService.js";

// Extend Express Request to carry the authenticated user payload.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prefer cookie; fall back to Bearer token for non-browser clients.
  const cookieToken: string | undefined = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  const token = cookieToken ?? bearerToken;

  if (!token) {
    res.status(401).json({ error: "Session expired" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    // Covers both TokenExpiredError and JsonWebTokenError
    res.status(401).json({ error: "Session expired" });
  }
}
