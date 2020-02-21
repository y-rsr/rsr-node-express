const express = require("express");
const router = express.Router();

const checkAuthenticated = require("../middleware");
const {
  createNewBooking,
  getAllBookings,
  updateBookingStatus,
  modifyPickupDate,
  createExtendedBooking
} = require("../controller/bookings");

router.post("/", checkAuthenticated, createNewBooking);

router.get("/:type", checkAuthenticated, getAllBookings);

router.put("/status/:type/:id", checkAuthenticated, updateBookingStatus);

router.put("/modify/pickup/:id", checkAuthenticated, modifyPickupDate);

router.post("/apply/extension", checkAuthenticated, createExtendedBooking);

module.exports = router;
