const express = require("express");
const router = express.Router();
const {
  createAdmin,
  loginAdmin,
  listAdmin,
  logout,
  resetAdminPassword,
  sendPasswordResetLink,
  changePassword,
  changeStatus,
  smtpSetting,
  adminSetting,
  settings,
  getDisplayInfo,
  apiKeySettings,
  googleWebmasterSetting
} = require("../controller/admin");

const { upload } = require("../functions");

const checkAuthenticated = require("../middleware");

router.post("/create", createAdmin);

router.post("/login", loginAdmin);

router.post("/forgot", sendPasswordResetLink);

router.post("/reset/password", resetAdminPassword);

router.post("/list", checkAuthenticated, listAdmin);

router.post("/logout/:id", checkAuthenticated, logout);

router.put("/change/status/:id", checkAuthenticated, changeStatus);

router.post("/change/password/:id", checkAuthenticated, changePassword);

router.post("/settings/smtp", checkAuthenticated, smtpSetting);

router.post(
  "/settings/admin",
  checkAuthenticated,
  upload.fields([
    { name: "logoFile", maxCount: 1 },
    { name: "bgimageFile", maxCount: 1 },
    { name: "faviconFile", maxCount: 1 }
  ]),
  adminSetting
);

router.post("/settings/apikey", checkAuthenticated, apiKeySettings);

router.post("/settings/webmaster", checkAuthenticated, googleWebmasterSetting);

router.get("/settings", checkAuthenticated, settings);

router.get("/siteinfo", getDisplayInfo);

module.exports = router;
