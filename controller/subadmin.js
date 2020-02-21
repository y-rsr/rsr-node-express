const bcrypt = require("bcryptjs");

const {
  MSG_SERVER_ERR,
  MSG_SUCCESS,
  MSG_BAD_REQ,
  MSG_UNAUTHORIZED,
  MSG_USER_NOT_EXISTS,
  MSG_EMAIL_EXISTS,
  MSG_USERNAME_EXISTS,
  MSG_USER_CREATED,
  MSG_USER_DATA_UPDT,
  MSG_DELETE_USER,
  MSG_PWD_CHANGED
} = require("../constants/messages");

const { ADMIN, ACTIVE, SUBADMIN } = require("../constants/appconstants");

const {
  listOneDocument,
  createOne,
  findDocument,
  resetPassword,
  updateOneDocument,
  updateMultipleDocuments
} = require("../model");

const {
  subadminSchema,
  subadmineditSchema
} = require("../validator/adminSchema");
const password = require("../validator").password;
const idSchema = require("../validator/statusSchema");

//View a subadmin, only accessible by superadmin
exports.listOneSubadmin = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  try {
    let superadmin = findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    let admin = listOneDocument(id, ADMIN);
    let result = await Promise.all([superadmin, admin]);

    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    if (!result[1]) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    delete result[1].password;
    return res.status(200).json(result[1]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Create a subadmin, only accessible by superadmin
exports.createSubadmin = async (req, res) => {
  try {
    req.checkBody(subadminSchema);
    const err = req.validationErrors();

    if (err) {
      return res.status(400).json(err);
    }

    const { name, username, email, password, privileges } = req.body;

    if (privileges !== undefined && privileges.length !== 23)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let superadmin = findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    let userwithemail = findDocument({ email }, ADMIN);
    let userwithusername = findDocument({ username }, ADMIN);
    let result = await Promise.all([
      userwithemail,
      userwithusername,
      superadmin
    ]);

    if (!result[2]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    if (result[0] !== null)
      return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);
    if (result[1] !== null)
      return res.status(401).json([{ msg: MSG_USERNAME_EXISTS }]);

    let formatPrivileges = [];
    privileges.forEach(privilege => {
      let data = {
        access: privilege.access,
        view: privilege.view,
        add: privilege.add,
        edit: privilege.edit,
        delete: privilege.delete
      };

      formatPrivileges.push(data);
    });

    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);
    const subadmin = {
      name: String(name).toLowerCase(),
      username,
      email,
      password: encodedPassword,
      status: ACTIVE,
      admintype: SUBADMIN,
      privileges: formatPrivileges,
      created: Date.now()
    };

    await createOne(subadmin, ADMIN);
    return res.status(200).json([{ msg: MSG_USER_CREATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Update subadmin properties and privileges, only accessible by superadmin
exports.updateOneSubadmin = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    req.checkBody(subadmineditSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    const { name, username, email, privileges } = req.body;

    if (privileges !== undefined && privileges.length !== 23)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let superadmin = findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    let userwithemail = findDocument({ email }, ADMIN);
    let userwithusername = findDocument({ username }, ADMIN);
    let subadminexists = listOneDocument(id, ADMIN);
    let result = await Promise.all([
      userwithemail,
      userwithusername,
      subadminexists,
      superadmin
    ]);

    if (!result[3]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    if (result[0] !== null && result[0]._id != id)
      return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);
    if (result[1] !== null && result[1]._id != id)
      return res.status(401).json([{ msg: MSG_USERNAME_EXISTS }]);
    if (result[2] === null)
      return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    let formatPrivileges = [];
    const subadmin = {
      name: String(name).toLowerCase(),
      username,
      email
    };

    if (privileges !== undefined) {
      privileges.forEach(privilege => {
        let data = {
          access: privilege.access,
          view: privilege.view,
          add: privilege.add,
          edit: privilege.edit,
          delete: privilege.delete
        };

        formatPrivileges.push(data);
      });

      subadmin.privileges = formatPrivileges;
    }

    await updateOneDocument(id, subadmin, ADMIN);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Update status of multiple subadmin, accessible only by superadmin
exports.updateManySubadmin = async (req, res) => {
  req.checkBody(idSchema);
  const err = req.validationErrors();
  if (err) {
    return res.status(400).json(err);
  }

  const { subadmin, status } = req.body;
  if (subadmin === undefined || subadmin.length === 0) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  try {
    let superadmin = await findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    if (!superadmin) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    await updateMultipleDocuments(subadmin, { status }, ADMIN);
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//To Delete a given subadmin, accessible only by superadmin
exports.deleteOneSubadmin = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  try {
    let superadmin = findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    const subAdmin = listOneDocument(id, ADMIN);
    let result = await Promise.all([superadmin, subAdmin]);

    if (!result[1]) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);
    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    await updateOneDocument(id, { markDelete: true }, ADMIN);
    return res.status(200).json([{ msg: MSG_DELETE_USER }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//To Delete multiple subadmin, accessible only by superadmin
exports.deleteManySubadmin = async (req, res) => {
  let subadmin = req.query.id;
  if (subadmin.length === 0) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  let isArray = Array.isArray(subadmin);
  if (!isArray) {
    subadmin = [subadmin];
  }

  try {
    let superadmin = await findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    if (!superadmin) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    await updateMultipleDocuments(subadmin, { markDelete: true }, ADMIN);
    return res.status(200).json([{ msg: MSG_DELETE_USER }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//To change Subadmin password in popup, accessible only by superadmin
exports.changePassword = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    req.checkBody({ password });
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let superadmin = findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    let adminuser = listOneDocument(id, ADMIN);
    let result = await Promise.all([superadmin, adminuser]);

    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    if (!result[1]) return res.status(404).json([{ msg: MSG_USER_NOT_EXISTS }]);

    const salt = await bcrypt.genSalt(10);
    const encpass = await bcrypt.hash(req.body.password, salt);

    await resetPassword(result[1]._id, encpass, ADMIN);
    return res.status(200).json([{ msg: MSG_PWD_CHANGED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
