const {
  name,
  key,
  link,
  metainfo,
  username,
  mobileoptional,
  email,
  password,
  address,
  amount,
  passwordoptional
} = require("../validator");

module.exports.adminSchema = {
  username,
  email,
  password
};

module.exports.subadminSchema = {
  name,
  username,
  email,
  password,
  "privileges.*.access": {
    notEmpty: true,
    matches: {
      options: [
        /\b(?:Owners|Drivers|Driver Accounts|Agents|Cars|Repossessions|Maintenance|Claims|Car Attributes|Bookings|Payments to Owners|Messages|Fee management|Manage City|Lien Holders|Newsletters|Static Pages|Reviews|Contact Us|Subscribers|Ambassador|GPS Tracking|Toll & Parking Tickets)\b/
      ],
      errorMessage: "INVALID ACCESS FIELD NAME"
    },
    errorMessage: "ACCESS FIELD NAME IS REQUIRED"
  },
  "privileges.*.view": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID VIEW PREVILAGE"
  },
  "privileges.*.add": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID ADD PREVILAGE"
  },
  "privileges.*.edit": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID EDIT PREVILAGE"
  },
  "privileges.*.delete": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID DELETE PREVILAGE"
  }
};

module.exports.subadmineditSchema = {
  name,
  username,
  email,
  "privileges.*.view": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID VIEW PREVILAGE"
  },
  "privileges.*.add": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID ADD PREVILAGE"
  },
  "privileges.*.edit": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID EDIT PREVILAGE"
  },
  "privileges.*.delete": {
    notEmpty: true,
    isBoolean: true,
    errorMessage: "INVALID DELETE PREVILAGE"
  }
};

module.exports.changePwdSchema = {
  currentPwd: passwordoptional,
  newPwd: password
};

module.exports.adminlist = {
  skip: {
    notEmpty: true,
    isNumeric: true,
    errorMessage: "INVALID OR EMPTY SKIP COUNT"
  },
  limit: {
    notEmpty: true,
    isNumeric: true,
    errorMessage: "INVALID OR EMPTY LIMIT COUNT"
  },
  search: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID OR EMPTY SEARCH KEY"
  },
  order: {
    notEmpty: true,
    matches: {
      options: [/\b(?:-1|1)\b/],
      errorMessage: "INVALID SORTING DETAIL"
    },
    errorMessage: "SORTING DETAIL IS REQUIRED"
  },
  field: {
    notEmpty: true,
    matches: {
      options: [
        /\b(?:name|email|username|admintype|loginDateTime|loginIP|logoutDateTime|status)\b/
      ],
      errorMessage: "INVALID SORT FIELD DETAIL"
    },
    errorMessage: "SORT FIELD DETAIL IS REQUIRED"
  }
};

module.exports.smtpSetting = {
  host: {
    notEmpty: true,
    matches: {
      options: ["^[a-zA-z0-9\\.]*$"],
      errorMessage: "INVALID HOST CHARACTERS"
    },
    errorMessage: "HOST NAME IS REQUIRED"
  },
  port: {
    notEmpty: true,
    isPort: true,
    errorMessage: "INVALID OR EMPTY PORT"
  },
  email,
  password: passwordoptional
};

module.exports.webMasterSettings = {
  metatitle: metainfo,
  metakeyword: metainfo,
  metadescription: metainfo,
  chatcode: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID LIVE CHAT CODE"
  },
  analyticscode: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID GOOGLE ANALYTICS CODE"
  },
  verificationcode: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID GOOGLE ANALYTICS CODE"
  },
  scripts: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID SCRIPT CHARACTERS"
  }
};

module.exports.keySettings = {
  insurancekey: key,
  insurancepolicy: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID INSURANCE POLICY CHARACTER"
  },
  policysequence: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID POLICY SEQUENCE CHARACTER"
  },
  s3bucketname: {
    optional: true,
    isAlphanumeric: true,
    errorMessage: "INVALID BUCKET NAME CHARACTER"
  },
  s3accesskey: key,
  s3secret: key,
  gclientid: key,
  gsecretkey: key,
  gdeveloperkey: key,
  gredirecturl: link,
  gmapapikey: key,
  twiliophone: mobileoptional,
  twiliosid: key,
  twilioaccntauth: key
};

module.exports.adminSettings = {
  username,
  email,
  sitename: name,
  logo: link,
  bgimage: link,
  favicon: link,
  footer: metainfo,
  contactaddress: address,
  custtel: mobileoptional,
  bookcartel: mobileoptional,
  contactemail: email,
  financetel: mobileoptional,
  financeemail: email,
  appstoreurl: link,
  playstoreurl: link,
  fblink: link,
  twitterlink: link,
  instalink: link,
  min_day: {
    optional: true,
    isNumeric: {
      options: [{ min: 1, max: 6 }]
    },
    errorMessage: "INVALID MINIMUM DAY DETAILS"
  },
  refferalbonus: amount,
  signupbonus: amount,
  sitemode: {
    notEmpty: true,
    matches: {
      options: [/\b(?:development|uat|production)\b/],
      errorMessage: "INVALID SITE MODE STATUS"
    },
    errorMessage: "SITE MODE STATUS IS REQUIRED"
  }
};
