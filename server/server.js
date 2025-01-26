const jsonServer = require("json-server");
const cors = require("cors");
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Ensure db.json exists
const dbPath = path.join(__dirname, "db.json");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify(
      {
        tasks: [
          {
            id: "1",
            title: "Example Task",
            description: "This is an example task",
            status: "todo",
          },
        ],
      },
      null,
      2
    )
  );
}

// Create JSON Server router
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== "production";

// Set up CORS
const corsOptions = {
  origin: isDevelopment ? "http://localhost:5173" : true,
  credentials: true,
};

// Apply middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(middlewares);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// API routes
app.use("/api", router);
console.log("API routes mounted at /api");

// In production, serve static files and handle React routing
if (!isDevelopment) {
  const distPath = path.join(__dirname, "../dist");
  console.log("Serving production build from:", distPath);

  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.log("Running in development mode - frontend served by Vite");
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  if (isDevelopment) {
    console.log(
      "Frontend dev server should be running on http://localhost:5173"
    );
  }
});
