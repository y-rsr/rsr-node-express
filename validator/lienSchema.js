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
  password
} = require("../validator");

module.exports.createlienSchema = {
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
  "privileges.*": {
    notEmpty: true,
    matches: {
      options: [
        /\b(?:Vehicles|Deleted Cars|Driver History|Booking Documents|Contract History|Driver Dues|Claims|Gps)\b/
      ],
      errorMessage: "INVALID MANAGEMENT NAME SELECTED"
    }
  }
};

module.exports.editlienSchema = {
  firstname,
  lastname,
  email,
  mobile,
  street,
  city,
  state,
  zip,
  country,
  "privileges.*": {
    notEmpty: true,
    matches: {
      options: [
        /\b(?:Vehicles|Deleted Cars|Driver History|Booking Documents|Contract History|Driver Dues|Claims|Gps)\b/
      ],
      errorMessage: "INVALID MANAGEMENT NAME SELECTED"
    }
  }
};

module.exports.listlienSchema = {
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
