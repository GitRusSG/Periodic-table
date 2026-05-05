/**
 * Express application factory.
 * Exported separately from index.ts so tests can import the app
 * without starting the HTTP server.
 */

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRouter } from "./auth/authRouter.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { progressionRouter } from "./progression/progressionRouter.js";
import { triviaRouter } from "./trivia/triviaRouter.js";
import { gameRouter } from "./game/gameRouter.js";

export function createApp() {
  const app = express();

  // --- Global middleware ---
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // --- Auth routes (public) ---
  app.use("/api/auth", authRouter);

  // --- Progression routes (protected) ---
  app.use("/api/progress", progressionRouter);

  // --- Trivia routes (GET is public, POST requires auth) ---
  app.use("/api/trivia", triviaRouter);

  // --- Game routes (all protected) ---
  app.use("/api/game", gameRouter);

  // --- Example protected route (demonstrates requireAuth middleware) ---
  app.get("/api/protected", requireAuth, (req, res) => {
    res.json({ message: `Hello, ${req.user?.username}` });
  });

  // --- Health check ---
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
