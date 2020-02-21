const express = require("express");
const router = express.Router();
const os = require("os");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const fs = require("fs");
const path = require("path");

const checkAuthenticated = require("../middleware");
const { listAllDocuments } = require("../model");

const {
  listfeeStructure,
  changefeeStatus,
  editfeeStructure,
  createfeeStructure,
  deletefeeStructure,
  filterfeeStructure
} = require("../controller/fees");

router.post("/:type", checkAuthenticated, createfeeStructure);

router.get("/filter/:type", checkAuthenticated, filterfeeStructure);

router.get("/:type", checkAuthenticated, listfeeStructure);

router.put("/:type/:id", checkAuthenticated, changefeeStatus);

router.put("/:type/:id/edit", checkAuthenticated, editfeeStructure);

router.delete("/:type/:id", checkAuthenticated, deletefeeStructure);

module.exports = router;
