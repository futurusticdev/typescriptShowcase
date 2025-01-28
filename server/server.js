// ... previous imports remain the same ...

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

  // Return as accessToken to match token type
  return { accessToken, refreshToken };
};

// ... Keep existing middleware and configurations ...

// Update auth routes to use accessToken in response
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    if (db.users.some((u) => u.email === email)) {
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
    console.log('Created token payload:', { userId: user.id, type: 'access' });
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = db.users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid password" });

    const { accessToken, refreshToken } = generateTokens(user.id);
    console.log('Created token payload:', { userId: user.id, type: 'access' });
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

app.post("/api/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required" });
  }

  try {
    const verified = jwt.verify(refreshToken, JWT_SECRET);
    
    if (verified.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(verified.userId);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// ... rest of the server code remains the same ...
