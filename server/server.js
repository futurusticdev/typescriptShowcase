const jsonServer = require("json-server");
const cors = require("cors");
const express = require("express");
const path = require("path");

const app = express();
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));

const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== "production";

// Set up CORS
const corsOptions = {
  origin: isDevelopment ? "http://localhost:5173" : true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// API routes
app.use("/api", router);

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
  if (isDevelopment) {
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(
      "Frontend dev server should be running on http://localhost:5173"
    );
  }
});
