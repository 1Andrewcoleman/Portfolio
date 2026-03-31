/**
 * Development server
 *
 * Serves static files on port 3000 and proxies /api/* requests to the
 * Express API running on port 3001.
 *
 * Usage:
 *   Terminal 1:  npm run dev:api   (starts the API on :3001)
 *   Terminal 2:  npm run dev       (starts this dev server on :3000)
 *
 * The contact form works end-to-end without any manual URL changes.
 */

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = 3000;
const API_PORT = 3001;

// Proxy /api requests to the API server
app.use(
  "/api",
  createProxyMiddleware({
    target: `http://localhost:${API_PORT}`,
    changeOrigin: true,
  })
);

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Dev server running on http://localhost:${PORT}`);
  console.log(`API proxy:  /api/* → http://localhost:${API_PORT}`);
});
