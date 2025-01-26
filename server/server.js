const jsonServer = require("json-server");
const cors = require("cors");
const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

// Ensure db.json exists with users
const dbPath = path.join(__dirname, "db.json");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify(
      {
        users: [],
        tasks: [],
      },
      null,
      2
    )
  );
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Auth routes
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  // Read current users
  const db = JSON.parse(fs.readFileSync(dbPath));

  // Check if user exists
  if (db.users.find((u) => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
  };

  // Save user
  db.users.push(user);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  // Create token
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Read current users
  const db = JSON.parse(fs.readFileSync(dbPath));

  // Find user
  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: "User not found" });

  // Check password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid password" });

  // Create token
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });
});

// Protected task routes
app.get("/api/tasks", authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  const userTasks = db.tasks.filter((task) => task.userId === req.user.id);
  res.json(userTasks);
});

app.post("/api/tasks", authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  const task = {
    ...req.body,
    id: Date.now().toString(),
    userId: req.user.id,
  };
  db.tasks.push(task);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(task);
});

app.put("/api/tasks/:id", authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  const taskIndex = db.tasks.findIndex(
    (t) => t.id === req.params.id && t.userId === req.user.id
  );
  if (taskIndex === -1)
    return res.status(404).json({ error: "Task not found" });

  db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...req.body };
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(db.tasks[taskIndex]);
});

app.delete("/api/tasks/:id", authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath));
  const taskIndex = db.tasks.findIndex(
    (t) => t.id === req.params.id && t.userId === req.user.id
  );
  if (taskIndex === -1)
    return res.status(404).json({ error: "Task not found" });

  db.tasks.splice(taskIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json({ message: "Task deleted" });
});

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
