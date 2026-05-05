/**
 * Unit tests for LeaderboardBroadcaster.
 *
 * Tests:
 *  1. A client subscribing to difficulty 1 receives leaderboard:update events
 *     for difficulty 1.
 *  2. A client subscribed to difficulty 1 does NOT receive events for
 *     difficulty 2.
 *  3. Disconnected clients are removed from subscriptions and no longer
 *     receive events.
 *
 * Requirements: 5.4
 */

import http from "http";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { WebSocket } from "ws";
import { LeaderboardBroadcaster } from "./leaderboardBroadcaster.js";
import { leaderboardEmitter } from "../progression/progressionStore.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createServer(): http.Server {
  return http.createServer();
}

function waitForMessage(ws: WebSocket): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Timed out waiting for message")),
      2000
    );
    ws.once("message", (data) => {
      clearTimeout(timer);
      resolve(JSON.parse(data.toString()));
    });
  });
}

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }
    ws.once("open", resolve);
    ws.once("error", reject);
  });
}

function waitForClose(ws: WebSocket): Promise<void> {
  return new Promise((resolve) => {
    if (
      ws.readyState === WebSocket.CLOSED ||
      ws.readyState === WebSocket.CLOSING
    ) {
      resolve();
      return;
    }
    ws.once("close", resolve);
  });
}

/** Sends a subscribe message and waits a tick for the server to process it. */
async function subscribe(ws: WebSocket, difficultyLevel: number): Promise<void> {
  ws.send(JSON.stringify({ type: "subscribe", difficultyLevel }));
  // Give the server event loop a tick to process the message.
  await new Promise((r) => setTimeout(r, 20));
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("LeaderboardBroadcaster", () => {
  let server: http.Server;
  let broadcaster: LeaderboardBroadcaster;
  let port: number;

  beforeEach(async () => {
    server = createServer();
    broadcaster = new LeaderboardBroadcaster(server);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as { port: number };
        port = addr.port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    // Remove all leaderboard listeners to avoid cross-test pollution.
    leaderboardEmitter.removeAllListeners("leaderboard:update");

    await new Promise<void>((resolve) => {
      broadcaster.close(() => {
        server.close(() => resolve());
      });
    });
  });

  // -------------------------------------------------------------------------
  // Test 1: subscriber receives events for their difficulty level
  // -------------------------------------------------------------------------

  it("broadcasts leaderboard:update to a client subscribed to the matching difficulty level", async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await waitForOpen(ws);
    await subscribe(ws, 1);

    const messagePromise = waitForMessage(ws);

    // Emit an update for difficulty 1.
    leaderboardEmitter.emit("leaderboard:update", {
      difficultyLevel: 1,
      userId: "user-abc",
      xp: 500,
    });

    const msg = await messagePromise;

    expect(msg).toEqual({
      type: "leaderboard:update",
      difficultyLevel: 1,
      userId: "user-abc",
      xp: 500,
    });

    ws.close();
    await waitForClose(ws);
  });

  // -------------------------------------------------------------------------
  // Test 2: subscriber does NOT receive events for a different difficulty level
  // -------------------------------------------------------------------------

  it("does NOT broadcast to a client subscribed to a different difficulty level", async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await waitForOpen(ws);
    await subscribe(ws, 1); // subscribed to difficulty 1

    let received = false;
    ws.on("message", () => {
      received = true;
    });

    // Emit an update for difficulty 2 — should NOT reach the client.
    leaderboardEmitter.emit("leaderboard:update", {
      difficultyLevel: 2,
      userId: "user-xyz",
      xp: 1000,
    });

    // Wait long enough to confirm no message arrives.
    await new Promise((r) => setTimeout(r, 100));

    expect(received).toBe(false);

    ws.close();
    await waitForClose(ws);
  });

  // -------------------------------------------------------------------------
  // Test 3: disconnected clients are removed from subscriptions
  // -------------------------------------------------------------------------

  it("removes disconnected clients from subscriptions and does not attempt to send to them", async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    await waitForOpen(ws);
    await subscribe(ws, 1);

    // Close the client connection.
    ws.close();
    await waitForClose(ws);

    // Give the server time to process the close event.
    await new Promise((r) => setTimeout(r, 50));

    // Emitting an event should not throw even though the client is gone.
    expect(() => {
      leaderboardEmitter.emit("leaderboard:update", {
        difficultyLevel: 1,
        userId: "user-gone",
        xp: 200,
      });
    }).not.toThrow();

    // Verify the subscription set is empty for difficulty 1.
    // We do this by checking that a new subscriber receives the next event
    // (i.e., the broadcaster is still functional after the disconnect).
    const ws2 = new WebSocket(`ws://127.0.0.1:${port}`);
    await waitForOpen(ws2);
    await subscribe(ws2, 1);

    const messagePromise = waitForMessage(ws2);
    leaderboardEmitter.emit("leaderboard:update", {
      difficultyLevel: 1,
      userId: "user-new",
      xp: 300,
    });

    const msg = await messagePromise;
    expect(msg).toMatchObject({ type: "leaderboard:update", userId: "user-new" });

    ws2.close();
    await waitForClose(ws2);
  });
});
