const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

// Set up CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production" ? [process.env.FRONTEND_URL] : true,
  optionsSuccessStatus: 200,
};

server.use(cors(corsOptions));
server.use(middlewares);

// Health check endpoint
server.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
