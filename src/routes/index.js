const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

const authMiddleware = require("./../middlewares/authMiddleware");

module.exports = function (app) {
  app.use("/auth", authRoutes);

  // Authenticate user for all routes below this middleware
  app.use(authMiddleware);

  app.use("/users", userRoutes);
};
