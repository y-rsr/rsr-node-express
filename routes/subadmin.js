const express = require("express");
const router = express.Router();

const checkAuthenticated = require("../middleware");
const {
  listOneSubadmin,
  createSubadmin,
  updateOneSubadmin,
  updateManySubadmin,
  deleteOneSubadmin,
  deleteManySubadmin,
  changePassword
} = require("../controller/subadmin");

router.get("/:id", checkAuthenticated, listOneSubadmin);

router.post("/", checkAuthenticated, createSubadmin);

router.put("/:id", checkAuthenticated, updateOneSubadmin);

router.put("/", checkAuthenticated, updateManySubadmin);

router.put("/change/password/:id", checkAuthenticated, changePassword);

router.delete("/:id", checkAuthenticated, deleteOneSubadmin);

router.delete("/", checkAuthenticated, deleteManySubadmin);

module.exports = router;
