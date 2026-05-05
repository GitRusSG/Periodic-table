/**
 * LeaderboardBroadcaster
 *
 * Wraps a WebSocket.Server and broadcasts leaderboard delta events to
 * clients subscribed to a specific difficulty level.
 *
 * Clients subscribe by sending:
 *   { type: "subscribe", difficultyLevel: N }
 *
 * The broadcaster listens to `leaderboardEmitter` (a Node.js EventEmitter
 * that fires "leaderboard:update" events whenever XP changes) and broadcasts:
 *   { type: "leaderboard:update", difficultyLevel: N, userId: string, xp: number }
 *
 * Requirements: 5.4
 */

import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import {
  leaderboardEmitter,
  type LeaderboardUpdateEvent,
  type DifficultyLevel,
} from "../progression/progressionStore.js";

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

interface SubscribeMessage {
  type: "subscribe";
  difficultyLevel: number;
}

interface LeaderboardUpdateMessage {
  type: "leaderboard:update";
  difficultyLevel: DifficultyLevel;
  userId: string;
  xp: number;
}

// ---------------------------------------------------------------------------
// LeaderboardBroadcaster
// ---------------------------------------------------------------------------

export class LeaderboardBroadcaster {
  private wss: WebSocketServer;

  /**
   * Map of difficultyLevel → Set of WebSocket clients subscribed to that level.
   */
  private subscriptions: Map<DifficultyLevel, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
      this.handleConnection(ws);
    });

    // Subscribe to leaderboard update events from the progression store.
    leaderboardEmitter.on(
      "leaderboard:update",
      (event: LeaderboardUpdateEvent) => {
        this.broadcast(event);
      }
    );
  }

  // -------------------------------------------------------------------------
  // Connection handling
  // -------------------------------------------------------------------------

  private handleConnection(ws: WebSocket): void {
    ws.on("message", (data) => {
      this.handleMessage(ws, data.toString());
    });

    ws.on("close", () => {
      this.removeClient(ws);
    });

    ws.on("error", () => {
      this.removeClient(ws);
    });
  }

  private handleMessage(ws: WebSocket, raw: string): void {
    let msg: unknown;
    try {
      msg = JSON.parse(raw);
    } catch {
      // Ignore malformed messages.
      return;
    }

    if (
      typeof msg === "object" &&
      msg !== null &&
      (msg as SubscribeMessage).type === "subscribe"
    ) {
      const { difficultyLevel } = msg as SubscribeMessage;
      if (
        typeof difficultyLevel === "number" &&
        difficultyLevel >= 1 &&
        difficultyLevel <= 5
      ) {
        this.subscribe(ws, difficultyLevel as DifficultyLevel);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Subscription management
  // -------------------------------------------------------------------------

  private subscribe(ws: WebSocket, difficultyLevel: DifficultyLevel): void {
    if (!this.subscriptions.has(difficultyLevel)) {
      this.subscriptions.set(difficultyLevel, new Set());
    }
    this.subscriptions.get(difficultyLevel)!.add(ws);
  }

  private removeClient(ws: WebSocket): void {
    for (const clients of this.subscriptions.values()) {
      clients.delete(ws);
    }
  }

  // -------------------------------------------------------------------------
  // Broadcasting
  // -------------------------------------------------------------------------

  private broadcast(event: LeaderboardUpdateEvent): void {
    const clients = this.subscriptions.get(event.difficultyLevel);
    if (!clients || clients.size === 0) return;

    const message: LeaderboardUpdateMessage = {
      type: "leaderboard:update",
      difficultyLevel: event.difficultyLevel,
      userId: event.userId,
      xp: event.xp,
    };
    const payload = JSON.stringify(message);

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /** Closes the underlying WebSocket server. Useful in tests. */
  close(callback?: () => void): void {
    leaderboardEmitter.removeAllListeners("leaderboard:update");
    this.wss.close(callback);
  }

  /** Exposes the underlying WebSocketServer (for testing). */
  get server(): WebSocketServer {
    return this.wss;
  }
}
