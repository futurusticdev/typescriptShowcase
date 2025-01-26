const jsonServer = require("json-server");
const cors = require("cors");
const express = require("express");
const path = require("path");

const app = express();
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "../dist"),
});

const PORT = process.env.PORT || 3000;

// Set up CORS
const corsOptions = {
  origin: true, // Allow all origins in development and production
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(middlewares);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// API routes
app.use("/api", router);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../dist")));

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Frontend files being served from: ${path.join(__dirname, "../dist")}`
  );
});
