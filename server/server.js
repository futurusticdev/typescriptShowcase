const jsonServer = require("json-server");
const cors = require("cors");
const express = require("express");
const path = require("path");

const app = express();
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3000;

// Set up CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://typescript-todo-app-04dbde53bff8.herokuapp.com"
      : "http://localhost:5173",
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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));

  // Handle React routing in production
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
