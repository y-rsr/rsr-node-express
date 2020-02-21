const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const emailSchema = require("../validator").email;
const status = require("../validator").status;
const {
  adminSchema,
  changePwdSchema,
  adminlist,
  smtpSetting,
  adminSettings,
  keySettings,
  webMasterSettings
} = require("../validator/adminSchema");
const { adminLoginSchema } = require("../validator/loginSchema");
const {
  MSG_SERVER_ERR,
  MSG_SUCCESS,
  MSG_SETTINGS_UPDATED,
  MSG_LOGOUT,
  MSG_AUTH_SUCCESS,
  MSG_BAD_REQ,
  MSG_INVALID_PWD,
  MSG_INVALID_USER,
  MSG_EMAIL_EXISTS,
  MSG_LINK_SENT,
  MSG_USERNAME_EXISTS,
  MSG_INVALID_ID,
  MSG_USER_DATA_UPDT,
  MSG_PWD_CHANGED,
  MSG_UNAUTHORIZED
} = require("../constants/messages");
const {
  SMTP,
  ADMIN,
  SUBADMIN,
  SETTINGS,
  WEBMASTER,
  APIKEY,
  ADMINSETTINGS
} = require("../constants/appconstants");

const {
  findDocument,
  createOne,
  resetPassword,
  listOneDocument,
  listAllDocuments,
  processQueryWithSkipAndLimit,
  processQuery,
  updateOneDocumentById
} = require("../model");

const { getUploadedFile } = require("../functions");

//To create a super-admin user
exports.createAdmin = async (req, res) => {
  req.checkBody(adminSchema);
  const err = req.validationErrors();

  if (err) {
    return res.status(400).json(err);
  }

  const { username, email, password } = req.body;

  try {
    let user;
    user = await findDocument({ email }, ADMIN);
    if (user) {
      return res.status(401).json([{ msg: MSG_EMAIL_EXISTS }]);
    }

    user = await findDocument({ username }, ADMIN);
    if (user) {
      return res.status(401).json([{ msg: MSG_USERNAME_EXISTS }]);
    }

    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);

    const admin = {
      username: String(username),
      email,
      password: encodedPassword,
      admintype: ADMIN
    };

    await createOne(admin, ADMIN);
    const payload = { email };
    const token = jwt.sign(payload, config.get("secret"), {
      expiresIn: 360000
    });

    return res.status(201).json([{ msg: MSG_SUCCESS, token }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To Login admin with username and password
exports.loginAdmin = async (req, res) => {
  req.checkBody(adminLoginSchema);
  const err = req.validationErrors();

  if (err) {
    return res.status(400).json(err);
  }

  const { username, email, password } = req.body;
  if (username === undefined && email === undefined) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  try {
    let admin;
    if (email !== undefined) {
      admin = await findDocument({ email }, ADMIN);
    } else {
      admin = await findDocument({ username }, ADMIN);
    }

    if (admin === null) {
      return res.status(401).json([{ msg: MSG_INVALID_USER }]);
    }

    const isCorrectPwd = await bcrypt.compare(password, admin.password);
    if (isCorrectPwd) {
      const payload = { email: admin.email };
      let loginDateTime = new Date();
      let loginIP = req.connection.remoteAddress;
      const token = jwt.sign(payload, config.get("secret"), {
        expiresIn: 360000
      });

      await updateOneDocumentById(admin._id, { loginDateTime, loginIP }, ADMIN);

      delete admin.password;
      return res
        .status(200)
        .json([{ status: 1, token, result: admin, msg: MSG_AUTH_SUCCESS }]);
    } else {
      return res.status(401).json([{ msg: MSG_INVALID_PWD }]);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To reset password from login page
exports.resetAdminPassword = async (req, res) => {
  req.checkBody(adminLoginSchema);
  const err = req.validationErrors();

  if (err) {
    return res.status(400).json(err);
  }

  const { username, email, password } = req.body;
  if (username === undefined && email === undefined) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  try {
    let admin;
    if (email !== undefined) {
      admin = await findDocument({ email }, ADMIN);
    } else {
      admin = await findDocument({ username }, ADMIN);
    }

    if (admin === null) {
      return res.status(401).json([{ msg: MSG_INVALID_USER }]);
    }

    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);
    await resetPassword(admin._id, encodedPassword, ADMIN);
    return res.status(200).json([{ msg: MSG_PWD_CHANGED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To reset password from outside login page
exports.sendPasswordResetLink = async (req, res) => {
  try {
    req.checkBody({ email: emailSchema });
    const err = req.validationErrors();

    if (err) return res.status(400).json(err);

    let emailPresent = await findDocument({ email: req.body.email }, ADMIN);
    if (!emailPresent) return res.status(404).json([{ msg: MSG_INVALID_USER }]);

    return res.status(200).json([{ msg: MSG_LINK_SENT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To List all the admin users, only accessible by superadmin
exports.listAdmin = async (req, res) => {
  try {
    req.checkBody(adminlist);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let query = { markDelete: null };
    if (req.body.search !== undefined) {
      let value = String(req.body.search).toLowerCase();
      query = {
        markDelete: null,
        $or: [
          { name: { $regex: `.*${value}.*` } },
          { email: { $regex: `.*${value}.*` } }
        ]
      };
    }

    let admin = await findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    if (!admin) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let data = await processQueryWithSkipAndLimit(
      req.body.skip,
      req.body.limit,
      req.body.order,
      req.body.field,
      query,
      ADMIN
    );

    data.docList.forEach(admin => {
      delete admin.password;
      if (admin.admintype === SUBADMIN) {
        delete admin.privileges;
      }
    });

    let resdata = {
      count: data.docCount,
      result: data.docList
    };

    return res.status(200).json(resdata);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To Logout admin users from the panel.
exports.logout = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const admin = await listOneDocument(id, ADMIN);
    if (!admin) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    let logoutDateTime = new Date();
    await updateOneDocumentById(admin._id, { logoutDateTime }, ADMIN);
    return res.status(200).json([{ msg: MSG_LOGOUT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To change password by the user itself
exports.changePassword = async (req, res) => {
  try {
    const id = req.params.id;
    req.checkBody(changePwdSchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    const admin = await listOneDocument(id, ADMIN);
    if (admin === null || admin.markDelete !== undefined)
      return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    if (admin.email !== req.email)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let isPwdCorrect = await bcrypt.compare(
      req.body.currentPwd,
      admin.password
    );
    if (!isPwdCorrect) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let salt = await bcrypt.genSalt(10);
    let encPwd = await bcrypt.hash(req.body.newPwd, salt);

    await resetPassword(admin._id, encPwd, ADMIN);
    return res.status(200).json([{ msg: MSG_PWD_CHANGED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To change status of subadmin, accessible only by superadmin
exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;

    req.checkBody({ status });
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let superadmin = findDocument(
      { email: req.email, admintype: ADMIN },
      ADMIN
    );
    let admin = listOneDocument(id, ADMIN);
    let result = await Promise.all([superadmin, admin]);

    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    if (!result[1]) return res.status(404).json([{ msg: MSG_INVALID_USER }]);

    await updateOneDocumentById(
      result[1]._id,
      { status: req.body.status },
      ADMIN
    );
    return res.status(200).json([{ msg: MSG_USER_DATA_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To Change main admin settings, only accessible by superadmin
exports.adminSetting = async (req, res) => {
  try {
    req.checkBody(adminSettings);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let admin = findDocument({ email: req.email, admintype: ADMIN }, ADMIN);
    let adminsetting = findDocument({ type: ADMINSETTINGS }, SETTINGS);
    let result = await Promise.all([admin, adminsetting]);

    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    if (!result[1]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let { files } = req;
    let logo = req.body.logo;
    let bgimage = req.body.bgimage;
    let favicon = req.body.favicon;

    if (files.logoFile !== undefined) {
      logo = await getUploadedFile(files.logoFile[0]);
    }
    if (files.bgimageFile !== undefined) {
      bgimage = await getUploadedFile(files.bgimageFile[0]);
    }
    if (files.faviconFile !== undefined) {
      favicon = await getUploadedFile(files.faviconFile[0]);
    }

    let settingsdata = {
      username: req.body.username,
      email: req.body.email,
      sitename: req.body.sitename,
      logo: logo,
      bgimage: bgimage,
      favicon: favicon,
      footer: req.body.footer,
      contactaddress: req.body.contactaddress,
      custtel: req.body.custtel,
      bookcartel: req.body.bookcartel,
      contactemail: req.body.contactemail,
      financetel: req.body.financetel,
      financeemail: req.body.financeemail,
      appstoreurl: req.body.appstoreurl,
      playstoreurl: req.body.playstoreurl,
      fblink: req.body.fblink,
      twitterlink: req.body.twitterlink,
      instalink: req.body.instalink,
      min_day: req.body.min_day,
      refferalbonus: req.body.refferalbonus,
      signupbonus: req.body.signupbonus,
      sitemode: req.body.sitemode
    };
    await updateOneDocumentById(result[1]._id, settingsdata, SETTINGS);
    return res.status(200).json([{ msg: MSG_SETTINGS_UPDATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To Change api key settings, only accessible by superadmin
exports.apiKeySettings = async (req, res) => {
  try {
    req.checkBody(keySettings);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let admin = findDocument({ email: req.email, admintype: ADMIN }, ADMIN);
    let smsettings = findDocument({ type: APIKEY }, SETTINGS);
    let result = await Promise.all([admin, smsettings]);

    if (!result[0] || !result[1])
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const data = {
      insurancekey: req.body.insurancekey,
      insurancepolicy: req.body.insurancepolicy,
      policysequence: req.body.policysequence,
      s3bucketname: req.body.s3bucketname,
      s3accesskey: req.body.s3accesskey,
      s3secret: req.body.s3secret,
      gclientid: req.body.gclientid,
      gsecretkey: req.body.gsecretkey,
      gdeveloperkey: req.body.gdeveloperkey,
      gredirecturl: req.body.gredirecturl,
      gmapapikey: req.body.gmapapikey,
      twiliophone: req.body.twiliophone,
      twiliosid: req.body.twiliosid,
      twilioaccntauth: req.body.twilioaccntauth
    };

    await updateOneDocumentById(result[1]._id, data, SETTINGS);
    return res.status(200).json([{ msg: MSG_SETTINGS_UPDATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To change webmaster key settings, only accessible by superadmin
exports.googleWebmasterSetting = async (req, res) => {
  try {
    req.checkBody(webMasterSettings);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    const {
      metatitle,
      metakeyword,
      metadescription,
      chatcode,
      analyticscode,
      verificationcode,
      scripts
    } = req.body;

    let admin = findDocument({ email: req.email, admintype: ADMIN }, ADMIN);
    let webmasterinfo = findDocument({ type: WEBMASTER }, SETTINGS);
    let result = await Promise.all([admin, webmasterinfo]);

    if (!result[0] || !result[1])
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let webdata = {
      metatitle,
      metakeyword,
      metadescription,
      chatcode,
      analyticscode,
      verificationcode,
      scripts
    };

    await updateOneDocumentById(result[1]._id, webdata, SETTINGS);
    return res.status(200).json([{ msg: MSG_SETTINGS_UPDATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To Change site's smtp settings, only accessible by superadmin
exports.smtpSetting = async (req, res) => {
  try {
    req.checkBody(smtpSetting);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let admin = findDocument({ email: req.email, admintype: ADMIN }, ADMIN);
    let smtpobj = findDocument({ type: SMTP }, SETTINGS);
    let result = await Promise.all([admin, smtpobj]);

    if (!result[0] || !result[1])
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const { host, port, email, password } = req.body;
    let salt = await bcrypt.genSalt(10);
    let encPwd = await bcrypt.hash(password, salt);
    let smtpdata = { host, port, email, password: encPwd };

    await updateOneDocumentById(result[1]._id, smtpdata, SETTINGS);
    return res.status(200).json([{ msg: MSG_SETTINGS_UPDATED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To get all the site's settings, only accessible by superadmin
exports.settings = async (req, res) => {
  try {
    let admin = findDocument({ email: req.email, admintype: ADMIN }, ADMIN);
    let docList = listAllDocuments(SETTINGS);

    let result = await Promise.all([admin, docList]);
    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    return res.status(200).json(result[1]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
//To get the basic site info display, public access
exports.getDisplayInfo = async (req, res) => {
  try {
    let document = await processQuery({ type: "ADMINSETTINGS" }, SETTINGS);
    if (document.length === 0)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const {
      username,
      email,
      sitename,
      logo,
      bgimage,
      favicon,
      footer
    } = document[0];

    return res
      .status(200)
      .json({ username, email, sitename, logo, bgimage, favicon, footer });
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
