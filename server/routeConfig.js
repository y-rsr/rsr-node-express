module.exports = routeConfig = app => {
  app.use("/api/admin", require("../routes/index"));
  app.use("/api/subadmin", require("../routes/subadmin"));
  app.use("/api/lien", require("../routes/lien"));
  app.use("/api/cars", require("../routes/car"));
  app.use("/api/attribute", require("../routes/carattributes"));
  app.use("/api/fees", require("../routes/fees"));
  app.use("/api/bookings", require("../routes/bookings"));
  app.use("/api", require("../routes/driver"));
};
