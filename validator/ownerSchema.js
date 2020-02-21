const {
  name,
  email,
  password,
  mobileoptional,
  streetoptional,
  houseoptional,
  zipoptional,
  achbank,
  achacntname,
  achaccount,
  abanumber,
  achacnttype,
  achemail,
  achacntusage,
  link
} = require("../validator");

module.exports.createownerSchema = {
  name,
  email,
  password,
  mobile: mobileoptional,
  street: streetoptional,
  house: houseoptional,
  zip: zipoptional,
  achbank,
  achacntname,
  achaccount,
  abanumber,
  achacnttype,
  achemail,
  achacntusage
};

module.exports.editownerSchema = {
  name,
  email,
  mobile: mobileoptional,
  street: streetoptional,
  house: houseoptional,
  zip: zipoptional,
  achbank,
  achacntname,
  achaccount,
  abanumber,
  achacnttype,
  achemail,
  achacntusage,
  userImage: link
};

module.exports.ownerlistSchema = {
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
        /\b(?:name|email|mobile|verified|openhours|emailVerified|phoneVerified|insurance|maintenance|cars|status|created)\b/
      ],
      errorMessage: "INVALID SORT FIELD DETAIL"
    },
    errorMessage: "SORT FIELD DETAIL IS REQUIRED"
  }
};
