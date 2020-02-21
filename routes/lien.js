const express = require("express");
const router = express.Router();

const checkAuthenticated = require("../middleware");
const {
  createLien,
  getAllLin,
  getLin,
  editLin,
  deleteLin,
  filterByQuery,
  resetLinPassword,
  createExportList,
  exportList,
  changeLienStatus
} = require("../controller/lien");

router.post("/", checkAuthenticated, createLien);

router.get("/", checkAuthenticated, getAllLin);

router.post("/list", checkAuthenticated, filterByQuery);

router.get("/:id", checkAuthenticated, getLin);

router.put("/:id/change/password", checkAuthenticated, resetLinPassword);

router.put("/:id", checkAuthenticated, editLin);

router.delete("/:id", checkAuthenticated, deleteLin);

router.post("/:id/status", checkAuthenticated, changeLienStatus);

router.get("/export/list", checkAuthenticated, createExportList);

router.get("/export/list/csv", exportList);

router.get("/test/test", async (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");
    res.setHeader("Content-Type", "application/pdf");
    const readStream = fs.createReadStream(
      path.resolve(__dirname, "../", "readme.txt"),
      "utf8"
    );
    let buffer = new Buffer.alloc(10 * 1024 * 1024, "base64");
    readStream.pipe(buffer);
    readStream.on("close", () => {
      return res.end(buffer);
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: "ERROR" }]);
  }
});

module.exports = router;
