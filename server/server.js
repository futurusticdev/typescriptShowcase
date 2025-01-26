import { create, router as _router } from "json-server";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = create();
const router = _router("db.json");
const app = express();

const PORT = process.env.PORT || 3000;

// Set up CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://typescript-todo-app.herokuapp.com"
      : "http://localhost:5173",
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
}

// API routes
app.use("/api", router);

// Handle React routing in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
