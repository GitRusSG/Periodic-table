/**
 * Server entry point — starts the HTTP server and WebSocket broadcaster.
 */

import http from "http";
import { createApp } from "./app.js";
import { LeaderboardBroadcaster } from "./leaderboard/leaderboardBroadcaster.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

const app = createApp();

// Wrap Express in a plain http.Server so the WebSocket server can share the
// same port.
const httpServer = http.createServer(app);

// Attach the leaderboard WebSocket broadcaster.
new LeaderboardBroadcaster(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
