const {
  initbookingSchema,
  extendedbookingSchema
} = require("../validator/bookingSchema");
const date = require("../validator").date;

const {
  DRIVER,
  BOOKINGS,
  VERFPENDING,
  VERFPASSED,
  VERFAILED,
  ADMIN,
  OWNER,
  STATUSCANC,
  ACTIVE,
  AWAITPICKUP,
  CNFPICKUP,
  STATUSCMPL,
  STATUSDROP,
  STATUSEXP,
  STATUSEXTD
} = require("../constants/appconstants");
const {
  MSG_SERVER_ERR,
  MSG_BAD_REQ,
  MSG_SUCCESS,
  MSG_INVALID_ID
} = require("../constants/messages");

const { getFareBreakdown, getExtendedFare } = require("../functions");
const {
  findDocument,
  listOneDocument,
  createOne,
  processQuery,
  updateOneDocument,
  updateOneDocumentById
} = require("../model");

exports.createNewBooking = async (req, res) => {
  try {
    req.checkBody(initbookingSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let random = Math.random() * 99999999;
    let startdate = new Date(req.body.datefrom);
    let enddate = new Date(req.body.dateto);
    let tenure = enddate.getDate() - startdate.getDate();
    let pickuptime = String(req.body.pickuptime);

    if (tenure <= 0) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let driverinfo = await listOneDocument(req.body.driverid, DRIVER);
    if (!driverinfo) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let getallInfo = await getFareBreakdown(
      req.body.carid,
      req.body.deductibleid,
      tenure
    );

    getallInfo.carinfo.bookingid = "RSC" + random.toString().substring(0, 8);
    getallInfo.carinfo.drivername =
      driverinfo.firstname + " " + driverinfo.lastname;
    getallInfo.carinfo.driverphone = driverinfo.mobile;
    getallInfo.carinfo.drivermail = driverinfo.email;
    getallInfo.carinfo.start = startdate;
    getallInfo.carinfo.end = enddate;
    getallInfo.carinfo.tenure = tenure;
    getallInfo.carinfo.pickuptime = pickuptime;
    getallInfo.carinfo.adminstatus = VERFPENDING;
    getallInfo.carinfo.ownerstatus = VERFPENDING;
    getallInfo.carinfo.extendible = true;
    getallInfo.carinfo.date = Date.now();
    getallInfo.carinfo.bookingstatus = VERFPENDING;

    await createOne(getallInfo, BOOKINGS);
    return res.status(200).json([{ msg: MSG_SUCCESS, getallInfo }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    let type = req.params.type;
    if (
      type !== ADMIN &&
      type !== OWNER &&
      type !== ACTIVE.toLowerCase() &&
      type !== STATUSCANC.toLowerCase() &&
      type !== AWAITPICKUP.toLowerCase() &&
      type !== STATUSCMPL.toLowerCase() &&
      type !== STATUSDROP.toLowerCase() &&
      type !== STATUSEXP.toLowerCase() &&
      type !== STATUSEXTD.toLowerCase()
    )
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let queryParams;
    if (type === ADMIN)
      queryParams = {
        "carinfo.adminstatus": VERFPENDING,
        "carinfo.ownerstatus": VERFPENDING
      };
    if (type === OWNER)
      queryParams = {
        "carinfo.adminstatus": VERFPASSED,
        "carinfo.ownerstatus": VERFPENDING
      };

    if (
      type === ACTIVE.toLowerCase() ||
      type === STATUSCANC.toLowerCase() ||
      type === AWAITPICKUP.toLowerCase() ||
      type === STATUSCMPL.toLowerCase() ||
      type === STATUSDROP.toLowerCase()
    )
      queryParams = { "carinfo.bookingstatus": String(type).toUpperCase() };

    if (type === STATUSEXP.toLowerCase())
      queryParams = {
        "carinfo.start": { $lt: new Date() },
        "carinfo.bookingstatus": VERFPENDING
      };

    if (type === STATUSEXTD.toLowerCase()) {
      queryParams = { "carinfo.extension": { $type: "int" } };
    }

    let bookingLists = await processQuery(queryParams, BOOKINGS);
    return res.status(200).json(bookingLists);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    if (type !== ADMIN && type !== OWNER)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let { status } = req.body;
    if (
      status !== VERFPASSED &&
      status !== VERFAILED &&
      status !== CNFPICKUP &&
      status !== STATUSCMPL
    )
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let updateParam;
    if (type === ADMIN)
      updateParam = {
        "carinfo.adminstatus": status,
        "carinfo.bookingstatus": status === VERFAILED ? STATUSCANC : VERFPENDING
      };
    else if (type === OWNER && (status === VERFAILED || status === VERFPASSED))
      updateParam = {
        "carinfo.ownerstatus": status,
        "carinfo.bookingstatus": status === VERFAILED ? STATUSCANC : AWAITPICKUP
      };
    else if (status === CNFPICKUP)
      updateParam = { "carinfo.bookingstatus": ACTIVE };

    let booking = await listOneDocument(id, BOOKINGS);
    if (!booking) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    if (type === OWNER && status === STATUSCMPL) {
      req.checkBody({ date });
      const err = req.validationErrors();
      if (err) return res.status(400).json(err);

      let completeddate = new Date(req.body.date);
      completeddate.setHours(0, 0, 0, 0);
      updateParam = { "carinfo.bookingstatus": STATUSCMPL };
      if (booking.carinfo.end.setHours(0, 0, 0, 0) > completeddate) {
        updateParam = { "carinfo.bookingstatus": STATUSDROP };
      }
    }

    await updateOneDocument(id, updateParam, BOOKINGS);
    return res.status(200).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.modifyPickupDate = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    req.checkBody({ modifieddate: date });
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let modifieddate = new Date(req.body.modifieddate);
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today > modifieddate.setHours(0, 0, 0, 0))
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let booking = await listOneDocument(id, BOOKINGS);
    if (!booking) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    let newstartdate = new Date(req.body.modifieddate);
    let enddatetimestamp = modifieddate.setDate(
      modifieddate.getDate() + booking.carinfo.tenure
    );
    let updateParam = {
      "carinfo.start": newstartdate,
      "carinfo.end": new Date(enddatetimestamp)
    };

    await updateOneDocument(id, updateParam, BOOKINGS);
    return res.status(200).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.createExtendedBooking = async (req, res) => {
  try {
    req.checkBody(extendedbookingSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    const { name, extenddate, reason, ownercredit } = req.body;
    let bookingdata = await findDocument(
      { "carinfo.drivername": name, "carinfo.bookingstatus": ACTIVE },
      BOOKINGS
    );

    if (!bookingdata) return res.status(400).json([{ msg: MSG_BAD_REQ }]);
    let extdate = new Date(extenddate);

    let newtenure;
    if (bookingdata.carinfo.extension !== undefined) {
      let extno = bookingdata.carinfo.extension;
      let prevext = bookingdata[`extension${extno}`];
      let prevextdate = prevext.extendeddate;
      if (prevextdate.setHours(0, 0, 0, 0) > extdate.setHours(0, 0, 0, 0))
        return res.status(400).json([{ msg: MSG_BAD_REQ }]);

      newtenure = extdate.getDate() - prevextdate.getDate();
    } else {
      if (
        bookingdata.carinfo.end.setHours(0, 0, 0, 0) >
        extdate.setHours(0, 0, 0, 0)
      )
        return res.status(400).json([{ msg: MSG_BAD_REQ }]);

      newtenure = extdate.getDate() - bookingdata.carinfo.end.getDate();
    }

    let prevfaredate = bookingdata.priceinfo;
    let prevtenure = bookingdata.carinfo.tenure;
    let priceinfo = getExtendedFare(prevfaredate, prevtenure, newtenure);

    let updateParams;
    if (bookingdata.carinfo.extension !== undefined) {
      let extno = bookingdata.carinfo.extension + 1;

      updateParams = {
        "carinfo.extension": extno,
        [`extension${extno}`]: {
          extendeddate: extdate,
          reason,
          ownercredit,
          priceinfo
        }
      };
    } else {
      updateParams = {
        "carinfo.extension": 1,
        extension1: {
          extendeddate: extdate,
          reason,
          ownercredit,
          priceinfo
        }
      };
    }

    await updateOneDocumentById(bookingdata._id, updateParams, BOOKINGS);
    return res.status(200).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
