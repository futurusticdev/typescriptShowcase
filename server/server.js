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
  columns: []
};

// Read and parse the database file
const getDb = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      // If file doesn't exist, create it with initial structure
      fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf8");
      return initialDb;
    }
    const data = fs.readFileSync(dbPath, "utf8");
    const db = JSON.parse(data);
    // Ensure the database has the required structure
    if (!db.users) db.users = [];
    if (!db.tasks) db.tasks = [];
    if (!db.columns) db.columns = [];
    return db;
  } catch (error) {
    console.error("Error reading database:", error);
    // If there's any error, return a fresh database
    return { ...initialDb };
  }
};

// Write to the database file
const saveDb = (db) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to database:", error);
    throw new Error("Failed to save to database");
  }
};

// Initialize database on startup
console.log("Initializing database...");
const db = getDb();
saveDb(db);
console.log("Database initialized successfully");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ACCESS_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    {
      userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY
    },
    JWT_SECRET
  );

  const refreshToken = jwt.sign(
    {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY
    },
    JWT_SECRET
  );

  return { accessToken, refreshToken };
};

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
    console.log('Verifying token:', token);
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Verified token payload:', verified);
    
    if (verified.type !== 'access') {
      console.log('Invalid token type:', verified.type);
      throw new Error('Invalid token type');
    }
    
    req.user = {
      id: verified.userId,
      type: verified.type
    };
    console.log('Set user object:', req.user);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    const isExpired = err.name === 'TokenExpiredError';
    res.status(isExpired ? 401 : 400).json({
      error: isExpired ? "Token expired" : "Invalid token",
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    });
  }
};

// Auth routes
app.post("/api/register", async (req, res) => {
  try {
    console.log('Register attempt:', {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      headers: req.headers
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = getDb();
    if (db.users.some((u) => u.email === email)) {
      console.log('User already exists:', { email });
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
    };

    db.users.push(user);
    saveDb(db);

    const { accessToken, refreshToken } = generateTokens(user.id);
    console.log('Registration successful:', { 
      userId: user.id,
      email: user.email,
      tokenType: 'access'
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Registration error:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      headers: req.headers
    });
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    console.log('Login attempt:', {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      headers: req.headers
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = getDb();
    const user = db.users.find((u) => u.email === email);
    
    if (!user) {
      console.log('User not found:', { email });
      return res.status(400).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', { email });
      return res.status(400).json({ error: "Invalid password" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    console.log('Login successful:', { 
      userId: user.id, 
      email: user.email,
      tokenType: 'access'
    });
    
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      headers: req.headers
    });
    res.status(500).json({ error: "Server error during login" });
  }
});

app.post("/api/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.log('Missing refresh token');
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const verified = jwt.verify(refreshToken, JWT_SECRET);
    
    if (verified.type !== 'refresh') {
      console.log('Invalid token type for refresh:', verified.type);
      throw new Error('Invalid token type');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(verified.userId);
    console.log('Token refresh successful:', {
      userId: verified.userId,
      tokenType: 'refresh'
    });
    
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ error: "Invalid refresh token" });
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

app.get("/api/columns", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const userColumns = db.columns.filter((column) => column.userId === req.user.id);
    res.json(userColumns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ error: "Server error while fetching columns" });
  }
});

app.post("/api/columns", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const column = {
      ...req.body,
      id: Date.now().toString(),
      userId: req.user.id,
    };
    db.columns.push(column);
    saveDb(db);
    res.json(column);
  } catch (error) {
    console.error("Error creating column:", error);
    res.status(500).json({ error: "Server error while creating column" });
  }
});

app.put("/api/columns/:id", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const columnIndex = db.columns.findIndex(
      (c) => c.id === req.params.id && c.userId === req.user.id
    );
    if (columnIndex === -1)
      return res.status(404).json({ error: "Column not found" });

    db.columns[columnIndex] = { ...db.columns[columnIndex], ...req.body };
    saveDb(db);
    res.json(db.columns[columnIndex]);
  } catch (error) {
    console.error("Error updating column:", error);
    res.status(500).json({ error: "Server error while updating column" });
  }
});

app.delete("/api/columns/:id", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const columnIndex = db.columns.findIndex(
      (c) => c.id === req.params.id && c.userId === req.user.id
    );
    if (columnIndex === -1)
      return res.status(404).json({ error: "Column not found" });

    db.columns.splice(columnIndex, 1);
    saveDb(db);
    res.json({ message: "Column deleted" });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Server error while deleting column" });
  }
});

// Health check endpoint under API
router.get("/health", (req, res) => {
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
