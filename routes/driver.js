const express = require("express");
const router = express.Router();

const {
  createDriver,
  createOwner,
  listDriver,
  listOwner,
  viewDriver,
  editDriver,
  editOwner,
  editOpenHours,
  editMultipleDriver,
  deleteDriver,
  deleteMultipleDriver,
  resetDriverPassword,
  changeSingleProperty,
  createExportList,
  exportList,
  createOwnerAgreementFile,
  exportOwnerAgreement,
  createDMV,
  viewDMV
} = require("../controller/driver");

const checkAuthenticated = require("../middleware");
const { upload } = require("../functions");

router.post(
  "/:user",
  checkAuthenticated,
  upload.fields([
    { name: "imageFile", maxCount: 1 },
    { name: "drivingLic", maxCount: 1 }
  ]),
  createDriver
);

router.post(
  "/:user/create",
  checkAuthenticated,
  upload.single("imageFile"),
  createOwner
);

router.post("/driver/:type", checkAuthenticated, listDriver);

router.post("/owner/:status", checkAuthenticated, listOwner);

router.get("/:user/view/:id", checkAuthenticated, viewDriver);

router.put(
  "/:user/:id",
  checkAuthenticated,
  upload.fields([
    { name: "imageFile", maxCount: 1 },
    { name: "drivingLic", maxCount: 1 }
  ]),
  editDriver
);

router.put("/owner/:id/edit/openhours", checkAuthenticated, editOpenHours);

router.put(
  "/:user/:id/edit",
  checkAuthenticated,
  upload.single("imageFile"),
  editOwner
);

router.put("/:user", checkAuthenticated, editMultipleDriver);

router.delete("/:user/:id", checkAuthenticated, deleteDriver);

router.delete("/:user", checkAuthenticated, deleteMultipleDriver);

router.put(
  "/:user/change/password/:id",
  checkAuthenticated,
  resetDriverPassword
);

router.post(
  "/:user/update/property/:id",
  checkAuthenticated,
  changeSingleProperty
);

router.get("/:user/list/export/:type", checkAuthenticated, createExportList);

router.get("/:user/list/export", exportList);

router.post(
  "/generate/agreement/pdf",
  checkAuthenticated,
  createOwnerAgreementFile
);

router.get("/download/agreement/pdf", exportOwnerAgreement);

router.get("/generate/dmv/:id", checkAuthenticated, createDMV);

router.get("/view/generated/dmv", viewDMV);

module.exports = router;
