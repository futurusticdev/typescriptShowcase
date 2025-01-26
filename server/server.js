import { create, router as _router } from "json-server";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const jsonServer = create();

// Set up the JSON Server router with the correct path to db.json
const router = _router(path.join(__dirname, "db.json"));

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

// Use json-server defaults
app.use(jsonServer.defaults());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// API routes with json-server
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
