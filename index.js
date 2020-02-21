const cors = require("cors");
const express = require("express");
const config = require("config");
const validator = require("express-validator");
const routeConfig = require("./server/routeConfig");
const responseConfig = require("./server/responseheaderConfig");

const app = express();

app.use(cors());
app.use(validator());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

responseConfig(app);
routeConfig(app);

app.listen(config.get("PORT"), config.get("HOSTNAME"), err => {
  if (err) console.log(err);
});
