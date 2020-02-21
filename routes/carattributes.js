const express = require("express");
const router = express.Router();

const checkAuthenticated = require("../middleware");
const upload = require("../functions").upload;

const {
  changeStatus,
  addCarFeature,
  editCarFeature,
  getCarAttribute,
  addCarAttribute,
  editCarAttribute,
  listCarAttributes,
  deleteCarAttribute,
  editMultipleCarAttribute,
  deleteMultipleCarAttribute
} = require("../controller/carattributes");

router.post(
  "/carfeature",
  checkAuthenticated,
  upload.single("featureImage"),
  addCarFeature
);

router.post("/:attribute", checkAuthenticated, addCarAttribute);

router.post("/change/status/:id", checkAuthenticated, changeStatus);

router.get("/:attribute/view/:id", checkAuthenticated, getCarAttribute);

router.put(
  "/carfeature/:id",
  checkAuthenticated,
  upload.single("featureImage"),
  editCarFeature
);

router.put("/:attribute/:id", checkAuthenticated, editCarAttribute);

router.put("/:attribute", checkAuthenticated, editMultipleCarAttribute);

router.post("/:attribute/list", checkAuthenticated, listCarAttributes);

router.delete("/:attribute/:id", checkAuthenticated, deleteCarAttribute);

router.delete("/:attribute", checkAuthenticated, deleteMultipleCarAttribute);

module.exports = router;
