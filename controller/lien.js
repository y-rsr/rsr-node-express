const bcrypt = require("bcryptjs");
const fs = require("fs");

const {
  createlienSchema,
  editlienSchema,
  listlienSchema
} = require("../validator/lienSchema");
const passwordSchema = require("../validator").password;

const {
  checkAdminHasAccess,
  createExportReport
} = require("../functions/index");

const { ACTIVE, LIEN, INACTIVE } = require("../constants/appconstants");
const {
  MSG_SERVER_ERR,
  MSG_EMAIL_EXISTS,
  MSG_BAD_REQ,
  MSG_INVALID_ID,
  MSG_UNAUTHORIZED,
  MSG_USER_CREATED,
  MSG_USER_DATA_UPDT,
  MSG_DELETE_USER,
  MSG_PWD_CHANGED
} = require("../constants/messages");

const {
  createOne,
  findDocument,
  processQueryWithSkipAndLimit,
  updateOneDocument,
  listAllDocuments,
  listOneDocument,
  deleteOneDocument
} = require("../model");

//Access private and privileged.
exports.createLien = async (req, res) => {
  req.checkBody(createlienSchema);
  const err = req.validationErrors();

  if (err) return res.status(400).json(err);
  const {
    firstname,
    lastname,
    email,
    mobile,
    street,
    city,
    state,
    zip,
    country,
    password,
    privileges
  } = req.body;

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "add");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let lien = await findDocument({ email }, LIEN);
    if (lien) return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);

    const salt = await bcrypt.genSalt(10);
    const encPwd = await bcrypt.hash(password, salt);

    const lienData = {
      firstname: String(firstname).toLowerCase(),
      lastname: String(lastname).toLowerCase(),
      email,
      password: encPwd,
      mobile,
      street,
      city: String(city).toLowerCase(),
      state,
      zip,
      country,
      privileges,
      status: ACTIVE,
      created: Date.now()
    };

    await createOne(lienData, LIEN);
    return res.status(200).json([{ msg: MSG_USER_CREATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access Privated and privileged.
exports.getAllLin = async (req, res) => {
  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let lienList = await listAllDocuments(LIEN);
    return res.status(200).json(lienList);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access Private and privileged.
exports.getLin = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let lien = await listOneDocument(id, LIEN);
    if (!lien) return res.status(404).json([{ msg: MSG_INVALID_ID }]);
    return res.status(200).json(lien);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access private and privileged.
exports.filterByQuery = async (req, res) => {
  try {
    req.checkBody(listlienSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let docList;

    const { skip, limit, field, order, search, start, end } = req.body;

    let queryParam = {};
    if (search !== undefined) {
      let value = String(search).toLowerCase();
      queryParam.$or = [
        { firstname: { $regex: `.*${value}.*` } },
        { lastname: { $regex: `.*${value}.*` } },
        { email: { $regex: `.*${value}.*` } }
      ];
    }

    if (start !== undefined && end !== undefined) {
      let datestart = new Date(start);
      let dateend = new Date(end);
      queryParam.created = {
        $gte: datestart.getTime(),
        $lte: dateend.getTime()
      };
    }

    docList = await processQueryWithSkipAndLimit(
      skip,
      limit,
      order,
      field,
      queryParam,
      LIEN
    );
    return res.status(200).json(docList);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access private and privileged.
exports.editLin = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(editlienSchema);
  const err = req.validationErrors();

  if (err) return res.status(400).json(err);
  const {
    firstname,
    lastname,
    email,
    mobile,
    street,
    city,
    state,
    zip,
    country,
    privileges
  } = req.body;

  const lienData = {
    firstname: String(firstname).toLowerCase(),
    lastname: String(lastname).toLowerCase(),
    email,
    mobile,
    street,
    city: String(city).toLowerCase(),
    state,
    zip,
    country,
    privileges
  };

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let lien = listOneDocument(id, LIEN);
    let lienwithemail = findDocument({ email }, LIEN);
    let result = await Promise.all([lien, lienwithemail]);

    if (!result[0]) return res.status(404).json([{ msg: MSG_INVALID_ID }]);
    if (result[1] !== null && result[1]._id != id)
      return res.status(404).json([{ msg: MSG_EMAIL_EXISTS }]);

    await updateOneDocument(id, lienData, LIEN);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access private and privileged.
exports.deleteLin = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "delete");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let lien = await listOneDocument(id, LIEN);
    if (!lien) return res.status(404).json([{ msg: MSG_INVALID_ID }]);
    await deleteOneDocument(id, LIEN);
    return res.status(200).json([{ msg: MSG_DELETE_USER }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access private and privileged.
exports.resetLinPassword = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody({ password: passwordSchema });
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);
  const password = req.body.password;

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let lien = await listOneDocument(id, LIEN);
    if (!lien) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    const salt = await bcrypt.genSalt(10);
    const encPwd = await bcrypt.hash(password, salt);
    await updateOneDocument(id, { password: encPwd }, LIEN);
    return res.status(200).json([{ msg: MSG_PWD_CHANGED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access Private and privileged.
exports.createExportList = async (req, res) => {
  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let headers = [
      { id: "_id", title: "id" },
      { id: "firstname", title: "First Name" },
      { id: "lastname", title: "Last Name" },
      { id: "email", title: "Email" },
      { id: "mobile", title: "contact No." },
      { id: "street", title: "Street" },
      { id: "city", title: "city" },
      { id: "state", title: "State" },
      { id: "zip", title: "zip" },
      { id: "country", title: "Country" },
      { id: "status", title: "Status" }
    ];

    let docList = await listAllDocuments(LIEN);
    let filepath = await createExportReport(headers, docList);
    return res.status(200).json([{ filepath }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.exportList = async (req, res) => {
  try {
    const filepath = req.query.filepath;
    if (!filepath) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const readStream = fs.createReadStream(filepath, "utf8");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + 'lien_holders.csv"'
    );

    readStream.pipe(res);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Access Private and Privileged.
exports.changeLienStatus = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let adminhasaccess = await checkAdminHasAccess(req.email, 15, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let lienholder = await listOneDocument(id, LIEN);
    if (!lienholder) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    let data = {};
    data.status = lienholder.status === ACTIVE ? INACTIVE : ACTIVE;
    await updateOneDocument(id, data, LIEN);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
