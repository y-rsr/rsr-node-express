const bcrypt = require("bcryptjs");
const fs = require("fs");

const {
  createdriverSchema,
  editdriverSchema,
  openhourSchema,
  driverlistSchema
} = require("../validator/driverSchema");
const password = require("../validator").password;
const {
  createownerSchema,
  editownerSchema,
  ownerlistSchema
} = require("../validator/ownerSchema");

const { createOwnerAgreement, createDMV } = require("../functions/createFiles");
const { checkAdminHasAccess } = require("../functions");

const {
  TYPEGREATER,
  TYPELESS,
  ACTIVE,
  INACTIVE,
  DRIVER,
  OWNER,
  ALL
} = require("../constants/appconstants");
const {
  MSG_INVALID_DOB,
  MSG_INVALID_EXP,
  MSG_SERVER_ERR,
  MSG_EMAIL_EXISTS,
  MSG_BAD_REQ,
  MSG_UNAUTHORIZED,
  MSG_USER_NOT_EXISTS,
  MSG_USER_CREATED,
  MSG_DELETE_USER,
  MSG_USER_DATA_UPDT,
  MSG_PWD_CHANGED
} = require("../constants/messages");

const { isValidDate, createExportReport } = require("../functions");
const {
  createOne,
  processQuery,
  findDocument,
  resetPassword,
  listOneDocument,
  deleteOneDocument,
  updateOneDocument,
  updateMultipleDocuments,
  deleteMultipleDocuments,
  processQueryWithSkipAndLimit,
  listDriversWithSkipLimitAndLookup
} = require("../model");

const { getUploadedFile } = require("../functions");
const getRefferalCode = name => {
  let code =
    name.substring(0, 4) +
    Math.random()
      .toString()
      .substring(2, 5);

  return code;
};

//Create a new driver record, accessible only by privileged admins.
exports.createDriver = async (req, res) => {
  const user = req.params.user;
  if (user !== DRIVER) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(createdriverSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const {
    firstname,
    lastname,
    sponsor,
    street,
    house,
    city,
    zip,
    email,
    password,
    mobile,
    license,
    state,
    dob,
    licexpdate
  } = req.body;

  let isvaliddob = isValidDate(TYPEGREATER, dob);
  if (!isvaliddob) return res.status(400).json([{ msg: MSG_INVALID_DOB }]);

  if (licexpdate !== undefined) {
    let isvalidexp = isValidDate(TYPELESS, licexpdate);
    if (!isvalidexp) return res.status(400).json([{ msg: MSG_INVALID_EXP }]);
  }

  let refferalCode = getRefferalCode(firstname);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 1, "add");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const user = await findDocument({ email }, DRIVER);
    if (user) {
      return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);
    }

    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);

    let { files } = req;
    let firstimageUri = "";
    let secondimageUri = "";
    if (files.imageFile !== undefined) {
      firstimageUri = await getUploadedFile(files.imageFile[0]);
    }
    if (files.drivingLic !== undefined) {
      secondimageUri = await getUploadedFile(files.drivingLic[0]);
    }

    let sponsordata = "";
    if (sponsor) {
      let sponsorPerson = await findDocument({ refferalCode: sponsor }, DRIVER);
      if (sponsorPerson !== null) {
        sponsordata =
          sponsorPerson.firstname +
          " " +
          sponsorPerson.lastname +
          "(" +
          sponsor +
          ")";
      }
    }

    const driverDate = {
      firstname: String(firstname).toLowerCase(),
      lastname: String(lastname).toLowerCase(),
      sponsor: sponsordata,
      dob: new Date(dob),
      userImage: firstimageUri,
      street,
      house: house === undefined ? "" : house,
      city: String(city).toLowerCase(),
      zip,
      email,
      password: encodedPassword,
      mobile,
      licImage: secondimageUri,
      license: license === undefined ? "" : license,
      licexpdate: licexpdate === undefined ? "" : new Date(licexpdate),
      state: state === undefined ? "" : state,
      verified: false,
      emailVerified: false,
      phoneVerified: false,
      specialAmb: false,
      ccupdatestatus: ACTIVE,
      status: ACTIVE,
      type: DRIVER,
      refferalCode,
      created: Date.now()
    };

    await createOne(driverDate, DRIVER);
    return res.status(200).json([{ msg: MSG_USER_CREATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Create a new owner, accessible only by privileged admins.
exports.createOwner = async (req, res) => {
  const user = req.params.user;
  if (user !== OWNER) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(createownerSchema);
  const err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  const {
    name,
    email,
    password,
    mobile,
    street,
    house,
    zip,
    achbank,
    achacntname,
    achaccount,
    abanumber,
    achacnttype,
    achemail,
    achacntusage
  } = req.body;

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 0, "add");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let owner = await findDocument({ email }, DRIVER);
    if (owner) return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);

    let { file } = req;
    let imageuri = "";
    if (file !== undefined) {
      imageuri = await getUploadedFile(file);
    }

    let refferalCode = getRefferalCode(name);

    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);

    const ownerData = {
      firstname: String(name).toLowerCase(),
      lastname: "",
      sponsor: "",
      dob: "",
      name: String(name).toLowerCase(),
      email,
      password: encodedPassword,
      userImage: imageuri,
      mobile: mobile === undefined ? "" : mobile,
      street: street === undefined ? "" : street,
      house: house === undefined ? "" : house,
      city: "",
      zip: zip === undefined ? "" : zip,
      licImage: "",
      license: "",
      licexpdate: "",
      state: "",
      achbank: achbank === undefined ? "" : achbank,
      achacntname: achacntname === undefined ? "" : achacntname,
      achaccount: achaccount === undefined ? "" : achaccount,
      abanumber: abanumber === undefined ? "" : abanumber,
      achacnttype: achacnttype === undefined ? "" : achacnttype,
      achemail: achemail === undefined ? "" : achemail,
      achacntusage: achacntusage === undefined ? "" : achacntusage,
      verified: false,
      emailVerified: false,
      phoneVerified: false,
      specialAmb: false,
      insurance: true,
      maintenance: false,
      ccupdatestatus: ACTIVE,
      status: ACTIVE,
      type: OWNER,
      cars: [],
      refferalCode,
      created: Date.now()
    };

    await createOne(ownerData, DRIVER);
    return res.status(200).json([{ msg: MSG_USER_CREATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//List all the drivers, accessible only by privileged admins.
exports.listDriver = async (req, res) => {
  try {
    const { type } = req.params;

    req.checkBody(driverlistSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    if (type !== ACTIVE.toLowerCase() && type !== ALL)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let query = { type: DRIVER };
    if (type === ACTIVE.toLowerCase()) {
      query.currentbooking = { $type: "string" };
    }

    if (req.body.search !== undefined) {
      let value = String(req.body.search).toLowerCase();
      query.$or = [
        { firstname: { $regex: `.*${value}.*` } },
        { lastname: { $regex: `.*${value}.*` } },
        { email: { $regex: `.*${value}.*` } }
      ];
    }

    if (req.body.owner !== undefined) {
      query.owner = String(req.body.owner).toLowerCase();
    }

    if (req.body.start !== undefined && req.body.end !== undefined) {
      let start = new Date(req.body.start);
      let end = new Date(req.body.end);
      query.created = {
        $gte: start.getTime(),
        $lte: end.getTime()
      };
    }

    let adminhasaccess = await checkAdminHasAccess(req.email, 1, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let result = await listDriversWithSkipLimitAndLookup(
      req.body.skip,
      req.body.limit,
      req.body.field,
      req.body.order,
      query
    );

    result.docList.forEach(doc => {
      delete doc.password;
    });

    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//List the owners, accessible only by privileged admins.
exports.listOwner = async (req, res) => {
  try {
    const { status } = req.params;

    req.checkBody(ownerlistSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    if (
      status !== ACTIVE.toLowerCase() &&
      status !== INACTIVE.toLowerCase() &&
      status !== ALL
    )
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let adminhasaccess = await checkAdminHasAccess(req.email, 0, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let query = { type: OWNER, status: status.toUpperCase() };

    if (status === ALL) {
      delete query.status;
    }

    if (req.body.search !== undefined) {
      let value = String(req.body.search).toLowerCase();
      query.$or = [
        { name: { $regex: `.*${value}.*` } },
        { email: { $regex: `.*${value}.*` } }
      ];
    }

    if (req.body.start !== undefined && req.body.end !== undefined) {
      let start = new Date(req.body.start);
      let end = new Date(req.body.end).setHours(24, 0, 0);
      query.created = {
        $gte: start.getTime(),
        $lte: end
      };
    }

    let result = await processQueryWithSkipAndLimit(
      req.body.skip,
      req.body.limit,
      req.body.order,
      req.body.field,
      query,
      DRIVER
    );

    result.docList.forEach(doc => {
      delete doc.password;
    });

    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//View a particular Driver, accessible only by privileged admins.
exports.viewDriver = async (req, res) => {
  const { id, user } = req.params;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (user !== DRIVER && user !== OWNER)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let index = user === OWNER ? 0 : 1;
    let adminhasaccess = await checkAdminHasAccess(req.email, index, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let driver = await listOneDocument(id, DRIVER);
    if (!driver) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    delete driver.password;
    return res.status(200).json(driver);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Edit a Driver, accessible only by privileged admins.
exports.editDriver = async (req, res) => {
  const { id, user } = req.params;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (user !== DRIVER) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(editdriverSchema);
  const err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  const {
    firstname,
    lastname,
    sponsor,
    street,
    house,
    city,
    zip,
    email,
    mobile,
    license,
    state,
    dob,
    licexpdate,
    userImage,
    licImage
  } = req.body;

  let isvaliddob = isValidDate(TYPEGREATER, dob);
  if (!isvaliddob) {
    return res.status(400).json([{ msg: MSG_INVALID_DOB }]);
  }

  if (licexpdate !== undefined) {
    let isvalidexp = isValidDate(TYPELESS, licexpdate);
    if (!isvalidexp) {
      return res.status(400).json([{ msg: MSG_INVALID_EXP }]);
    }
  }

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 1, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const userdriver = findDocument({ email }, DRIVER);
    const driver = listOneDocument(id, DRIVER);
    let result = await Promise.all([userdriver, driver]);

    if (!result[0] !== null && result[0]._id != id)
      return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);

    if (!result[1]) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    let { files } = req;
    let firstimageUri = userImage;
    let secondimageUri = licImage;
    if (files.imageFile !== undefined) {
      firstimageUri = await getUploadedFile(files.imageFile[0]);
    }
    if (files.drivingLic !== undefined) {
      secondimageUri = await getUploadedFile(files.drivingLic[0]);
    }

    let sponsordata = "";
    if (sponsor) {
      let sponsorPerson = await findDocument({ refferalCode: sponsor }, DRIVER);
      if (sponsorPerson !== null) {
        sponsordata =
          sponsorPerson.firstname +
          " " +
          sponsorPerson.lastname +
          "(" +
          sponsor +
          ")";
      }
    }

    const driverDate = {
      firstname: String(firstname).toLowerCase(),
      lastname: String(lastname).toLowerCase(),
      sponsor: sponsordata,
      dob: new Date(dob),
      userImage: firstimageUri,
      street,
      house: house === undefined ? "" : house,
      city: String(city).toLowerCase(),
      zip,
      email,
      mobile,
      licImage: secondimageUri,
      license: license === undefined ? "" : license,
      licexpdate: licexpdate === undefined ? "" : new Date(licexpdate),
      state: state === undefined ? "" : state
    };

    await updateOneDocument(id, driverDate, DRIVER);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Edit an Owner, accessible only by privileged admins.
exports.editOwner = async (req, res) => {
  const { id, user } = req.params;
  if (!id || user !== OWNER)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(editownerSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const {
    name,
    email,
    mobile,
    street,
    house,
    zip,
    achbank,
    achacntname,
    achaccount,
    abanumber,
    achacnttype,
    achemail,
    achacntusage,
    userImage
  } = req.body;

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 0, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const owner = findDocument({ email }, DRIVER);
    const ownerexists = listOneDocument(id, DRIVER);
    const result = await Promise.all([owner, ownerexists]);
    if (result[0] !== null && result[0]._id != id)
      return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);

    if (!result[1]) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    let { file } = req;
    let imageuri = userImage;
    if (file !== undefined) {
      imageuri = await getUploadedFile(file);
    }

    const ownerData = {
      name: String(name).toLowerCase(),
      email,
      userImage: imageuri,
      mobile: mobile === undefined ? "" : mobile,
      street: street === undefined ? "" : street,
      house: house === undefined ? "" : house,
      zip: zip === undefined ? "" : zip,
      achbank: achbank === undefined ? "" : achbank,
      achacntname: achacntname === undefined ? "" : achacntname,
      achaccount: achaccount === undefined ? "" : achaccount,
      abanumber: abanumber === undefined ? "" : abanumber,
      achacnttype: achacnttype === undefined ? "" : achacnttype,
      achemail: achemail === undefined ? "" : achemail,
      achacntusage: achacntusage === undefined ? "" : achacntusage
    };

    await updateOneDocument(id, ownerData, DRIVER);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Edit an Owner Open Hours, accessible only by privileged admins.
exports.editOpenHours = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    req.checkBody(openhourSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let adminhasaccess = await checkAdminHasAccess(req.email, 0, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let owner = await listOneDocument(id, DRIVER);
    if (!owner) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    const { days, hours } = req.body;

    let data = { openhours: { days, hours } };
    await updateOneDocument(id, data, DRIVER);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Change status of multiple driver/owner, accessible only by privileged admins.
exports.editMultipleDriver = async (req, res) => {
  const userType = req.params.user;
  if (userType !== DRIVER && userType !== OWNER)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  const { field, user, value } = req.body;
  if (user === undefined || user.length === 0) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  const statusTypeFields = /status/;
  const checkStatus = /ACTIVE|INACTIVE/;

  let validStatus = checkStatus.test(value);
  const isValidStatusField = statusTypeFields.test(field);

  if (!isValidStatusField || !validStatus)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  let updateData = { [field]: value };

  try {
    let index = userType === OWNER ? 0 : 1;
    let adminhasaccess = await checkAdminHasAccess(req.email, index, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    await updateMultipleDocuments(user, updateData, DRIVER);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Delete owner/driver, accessible only by privileged admins.
exports.deleteDriver = async (req, res) => {
  const { id, user } = req.params;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (user !== DRIVER && user !== OWNER)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let index = user === OWNER ? 0 : 1;
    let adminhasaccess = await checkAdminHasAccess(req.email, index, "delete");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const driver = await listOneDocument(id, DRIVER);
    if (!driver) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    await deleteOneDocument(id, DRIVER);
    return res.status(200).json([{ msg: MSG_DELETE_USER }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Delete multiple owner/driver, accessible only by privileged admins.
exports.deleteMultipleDriver = async (req, res) => {
  let idList = req.query.id;
  const user = req.params.user;
  if (user !== DRIVER && user !== OWNER)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (idList.length === 0) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  let isArray = Array.isArray(idList);
  if (!isArray) {
    idList = [idList];
  }

  try {
    let index = user === OWNER ? 0 : 1;
    let adminhasaccess = await checkAdminHasAccess(req.email, index, "delete");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    await deleteMultipleDocuments(idList, DRIVER);
    return res.status(200).json([{ msg: MSG_DELETE_USER }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//To Change an owner/driver password, accessible only by privileged admins.
exports.resetDriverPassword = async (req, res) => {
  const { user, id } = req.params;
  if ((user !== DRIVER && user !== OWNER) || !id)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody({ password });
  const err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  try {
    let index = user === OWNER ? 0 : 1;
    let adminhasaccess = await checkAdminHasAccess(req.email, index, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const driver = await listOneDocument(id, DRIVER);
    if (!driver) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(req.body.password, salt);

    await resetPassword(driver._id, encodedPassword, DRIVER);
    return res.status(200).json([{ msg: MSG_PWD_CHANGED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//To Change an owner/driver property, accessible only by privileged admins.
exports.changeSingleProperty = async (req, res) => {
  try {
    const { id, user } = req.params;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    if (user !== OWNER && user !== DRIVER)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const { field } = req.body;
    const validfields = /verified|emailVerified|phoneVerified|specialAmb|insurance|maintenance|ccupdatestatus|status/;
    const isValidField = validfields.test(field);

    if (!isValidField) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let index = user === OWNER ? 0 : 1;
    let adminhasaccess = await checkAdminHasAccess(req.email, index, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let driver = await listOneDocument(id, DRIVER);
    if (!driver) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    let value;
    if (typeof driver[field] === "boolean") {
      value = !driver[field];
    } else {
      value = driver[field] === ACTIVE ? INACTIVE : ACTIVE;
    }

    await updateOneDocument(id, { [field]: value }, DRIVER);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//To Export List of Driver/Owner accessible only by privileged admins.
exports.createExportList = async (req, res) => {
  const { user, type } = req.params;

  if (user !== OWNER && user !== DRIVER)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (
    type !== ALL &&
    type !== ACTIVE.toLowerCase() &&
    type !== INACTIVE.toLowerCase()
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  let query = { type: user };
  if (type === ACTIVE.toLowerCase() && user === DRIVER)
    query.currentbooking = { $type: "string" };
  else if (type === INACTIVE.toLowerCase() && user === DRIVER)
    query.currentbooking = null;
  else if (user === OWNER && type !== ALL) query.status = type.toUpperCase();

  try {
    let index = user === OWNER ? 0 : 1;
    let adminhasaccess = await checkAdminHasAccess(req.email, index, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let docList = await processQuery(query, DRIVER);
    let header =
      user === OWNER
        ? [
            { id: "_id", title: "id" },
            { id: "name", title: "Owner Name" },
            { id: "email", title: "Email" },
            { id: "mobile", title: "Contact No." },
            { id: "street", title: "Street" },
            { id: "house", title: "House" },
            { id: "zip", title: "zip" },
            { id: "achbank", title: "ACH Bank" },
            { id: "achacntname", title: "ACH Account Name" },
            { id: "achaccount", title: "ACH Account" },
            { id: "achacnttype", title: "ACH Account Type" },
            { id: "achemail", title: "ACH Email" },
            { id: "achacntusage", title: "ACH Account Usage" },
            { id: "status", title: "Status" },
            { id: "cars", title: "Cars" }
          ]
        : [
            { id: "_id", title: "id" },
            { id: "firstname", title: "First Name" },
            { id: "lastname", title: "Last Name" },
            { id: "dob", title: "DOB" },
            { id: "email", title: "Email" },
            { id: "mobile", title: "Contact No." },
            { id: "street", title: "Street" },
            { id: "house", title: "House" },
            { id: "city", title: "City" },
            { id: "zip", title: "zip" },
            { id: "license", title: "License" },
            { id: "licexpdate", title: "License Exp Date" },
            { id: "state", title: "State" }
          ];

    docList.forEach(doc => {
      doc.dob = new Date(doc.dob).toDateString();
      doc.licexpdate = new Date(doc.licexpdate).toDateString();
    });

    let filepath = await createExportReport(header, docList);
    return res.status(200).json([{ filepath }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_BAD_REQ }]);
  }
};

exports.exportList = async (req, res) => {
  try {
    const user = req.params.user;
    const filepath = req.query.filepath;
    if (!filepath) return res.status(400).json([{ msg: MSG_BAD_REQ }]);
    const readStream = fs.createReadStream(filepath, "utf8");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + `${user}.csv` + '"'
    );
    readStream.pipe(res);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Create Owner Agreement, accessible only by privileged admins.
exports.createOwnerAgreementFile = async (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json([{ msg: MSG_BAD_REQ }]);
    let adminhasaccess = await checkAdminHasAccess(req.email, 0, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let filepath = await createOwnerAgreement(req.body.name);
    return res.status(200).json([{ filepath }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.exportOwnerAgreement = async (req, res) => {
  try {
    const filepath = req.query.filepath;
    if (!filepath) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const readStream = fs.createReadStream(filepath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + "owner_agreement.pdf" + '"'
    );
    readStream.pipe(res);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//To Create Driver DMV File, accessible only by privileged admins.
exports.createDMV = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let adminhasaccess = await checkAdminHasAccess(req.email, 1, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let driver = await listOneDocument(id, DRIVER);
    if (!driver) return res.status(400).json([{ msg: MSG_BAD_REQ }]);
    let filepath = await createDMV(driver);
    return res.status(200).json([{ filepath }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.viewDMV = async (req, res) => {
  try {
    let filepath = req.query.filepath;
    if (!filepath) return res.status(400).json([{ msg: MSG_BAD_REQ }]);
    let readStream = fs.createReadStream(filepath);
    res.setHeader("Content-Type", "application/pdf");
    readStream.pipe(res);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
