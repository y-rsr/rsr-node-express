const {
  firstname,
  lastname,
  dob,
  street,
  houseoptional,
  city,
  zip,
  email,
  password,
  mobile,
  license,
  licexpdate,
  stateoptional,
  sponsor,
  link
} = require("../validator");

module.exports.createdriverSchema = {
  firstname,
  lastname,
  dob,
  street,
  house: houseoptional,
  city,
  zip,
  email,
  password,
  mobile,
  license,
  licexpdate,
  state: stateoptional,
  sponsor
};

module.exports.editdriverSchema = {
  firstname,
  lastname,
  dob,
  street,
  house: houseoptional,
  city,
  zip,
  email,
  mobile,
  license,
  licexpdate,
  state: stateoptional,
  sponsor,
  userImage: link,
  licImage: link
};

module.exports.openhourSchema = {
  "days.*": {
    notEmpty: true,
    matches: {
      options: [
        /\b(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/
      ],
      errorMessage: "INVALID DAY"
    },
    errorMessage: "OPEN DAYS ARE REQUIRED"
  },
  "hours.*": {
    notEmpty: true,
    matches: {
      options: [
        /\b(?:08:00AM|09:00AM|10:00AM|11:00AM|NOON|01:00PM|02:00PM|03:00PM|04:00PM|05:00PM|06:00PM|07:00PM)\b/
      ],
      errorMessage: "INVALID HOUR"
    },
    errorMessage: "OPEN HOURS ARE REQUIRED"
  }
};

module.exports.driverlistSchema = {
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
        /\b(?:firstname|email|mobile|verified|specialAmb|emailVerified|phoneVerified|refferalCode|sponsor|created|status|ccupdatestatus|vin|ownername|make|model|extendeddate)\b/
      ],
      errorMessage: "INVALID SORT FIELD DETAIL"
    },
    errorMessage: "SORT FIELD DETAIL IS REQUIRED"
  }
};
