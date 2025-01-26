const jsonServer = require("json-server");
const cors = require("cors");
const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

// Ensure db.json exists with initial structure
const dbPath = path.join(__dirname, "db.json");
const initialDb = {
  users: [],
  tasks: [],
};

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
}

// Read and parse the database file
const getDb = () => {
  const data = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(data);
};

// Write to the database file
const saveDb = (db) => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

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
  try {
    const { email, password } = req.body;
    const db = getDb();

    // Check if user exists
    if (db.users.some((u) => u.email === email)) {
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
    saveDb(db);

    // Create token
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Protected task routes
app.get("/api/tasks", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const userTasks = db.tasks.filter((task) => task.userId === req.user.id);
    res.json(userTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Server error while fetching tasks" });
  }
});

app.post("/api/tasks", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const task = {
      ...req.body,
      id: Date.now().toString(),
      userId: req.user.id,
    };
    db.tasks.push(task);
    saveDb(db);
    res.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Server error while creating task" });
  }
});

app.put("/api/tasks/:id", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const taskIndex = db.tasks.findIndex(
      (t) => t.id === req.params.id && t.userId === req.user.id
    );
    if (taskIndex === -1)
      return res.status(404).json({ error: "Task not found" });

    db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...req.body };
    saveDb(db);
    res.json(db.tasks[taskIndex]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Server error while updating task" });
  }
});

app.delete("/api/tasks/:id", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const taskIndex = db.tasks.findIndex(
      (t) => t.id === req.params.id && t.userId === req.user.id
    );
    if (taskIndex === -1)
      return res.status(404).json({ error: "Task not found" });

    db.tasks.splice(taskIndex, 1);
    saveDb(db);
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Server error while deleting task" });
  }
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

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.error("Production build directory not found:", distPath);
  }
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
