const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

// Set up CORS for specific origins in production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://your-frontend-domain.com"] // Replace with your frontend domain
      : true,
  optionsSuccessStatus: 200,
};

server.use(cors(corsOptions));
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

server.use(router);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
