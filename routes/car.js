const express = require("express");
const router = express.Router();

const checkAuthenticated = require("../middleware");
const {
  getCar,
  editCar,
  listCars,
  deleteCar,
  createCar,
  createCSVFile,
  exportCSVFile,
  updateProperty
} = require("../controller/car");

const upload = require("../functions").upload;

router.post(
  "/",
  checkAuthenticated,
  upload.fields([
    { name: "regCert", maxCount: 1 },
    { name: "uberLyftCert", maxCount: 1 }
  ]),
  createCar
);

router.get("/view/:id", checkAuthenticated, getCar);

router.post("/list", checkAuthenticated, listCars);

router.put(
  "/:id",
  checkAuthenticated,
  upload.fields([
    { name: "regCert", maxCount: 1 },
    { name: "uberLyftCert", maxCount: 1 }
  ]),
  editCar
);

router.put("/property/update/:id", checkAuthenticated, updateProperty);

router.delete("/:id", checkAuthenticated, deleteCar);

router.get("/create/export/list", checkAuthenticated, createCSVFile);

router.get("/export/list", exportCSVFile);

module.exports = router;
