const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");
const express = require("express");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "../dist"),
});

// Set up CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production" ? [process.env.FRONTEND_URL] : true,
  optionsSuccessStatus: 200,
};

server.use(cors(corsOptions));
server.use(middlewares);

// Health check endpoint
server.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// API routes
server.use("/api", router);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  server.use(express.static(path.join(__dirname, "../dist")));

  // Handle React routing, return all requests to React app
  server.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
