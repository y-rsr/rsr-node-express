module.exports.name = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9]*$"],
    errorMessage: "INVALID NAME CHARACTERS "
  },
  isLength: {
    options: [{ max: 30 }],
    errorMessage: "NAME EXCEEDS 30 CHARACTERS"
  },
  errorMessage: "INVALID OR EMPTY NAME FIELD"
};

module.exports.username = {
  notEmpty: true,
  isAlphanumeric: true,
  errorMessage: "INVALID OR EMPTY USERNAME"
};

module.exports.email = {
  notEmpty: true,
  isEmail: true,
  errorMessage: "INVALID OR EMPTY EMAIL"
};

module.exports.password = {
  notEmpty: true,
  isLength: {
    options: [{ min: 8 }],
    errorMessage: "MINIMUM 8 CHARACTERS REQUIRED"
  },
  matches: {
    options: ["^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$"],
    errorMessage: "INVALID PASSWORD CHARACTERS FORMAT"
  },
  errorMessage: "PASSWORD IS REQUIRED"
};

module.exports.usernameoptional = {
  optional: true,
  matches: {
    options: ["^[a-zA-z 0-9\\@\\&\\_\\-]*$"],
    errorMessage: "INVALID USERNAME CHARACTERS"
  }
};

module.exports.emailoptional = {
  optional: true,
  isEmail: true,
  errorMessage: "INVALID EMAIL"
};

module.exports.passwordoptional = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\.\\@\\!\\#\\$\\%\\&\\_\\-\\+\\*]*$"],
    errorMessage: "INVALID PASSWORD CHARACTERS FORMAT"
  },
  errorMessage: "PASSWORD IS REQUIRED"
};

module.exports.status = {
  notEmpty: true,
  matches: {
    options: [/\b(?:ACTIVE|INACTIVE)\b/],
    errorMessage: "INVALID STATUS"
  },
  errorMessage: "STATUS IS REQUIRED"
};

module.exports.firstname = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-z 0-9\\@\\&\\_\\-]*$"],
    errorMessage: "INVALID FIRSTNAME CHARACTERS"
  },
  errorMessage: "FIRSTNAME IS REQUIRED"
};

module.exports.lastname = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-z 0-9\\@\\&\\_\\-]*$"],
    errorMessage: "INVALID LASTNAME CHARACTERS"
  },
  errorMessage: "LASTNAME IS REQUIRED"
};

module.exports.dob = {
  notEmpty: true,
  matches: {
    options: ["^\\d{2}/\\d{2}/\\d{4}$"],
    errorMessage: "INVALID DOB CHARACTER"
  },
  errorMessage: "DOB IS REQUIRED"
};

module.exports.street = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\(\\)\\-\\:\\,\\&\\.\\/]*$"],
    errorMessage: "INVALID STREET CHARACTER"
  },
  errorMessage: "STREET IS REQUIRED"
};

module.exports.streetoptional = {
  optional: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\(\\)\\-\\:\\,\\&\\.\\/]*$"],
    errorMessage: "INVALID STREET CHARACTER"
  }
};

module.exports.house = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\(\\)\\-\\:\\,\\&\\.]*$"],
    errorMessage: "INVALID HOUSE/APT CHARACTER"
  }
};

module.exports.houseoptional = {
  optional: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\(\\)\\-\\:\\,\\&\\.]*$"],
    errorMessage: "INVALID HOUSE/APT CHARACTER"
  }
};

module.exports.city = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\(\\)\\-\\:\\,\\&\\.]*$"],
    errorMessage: "INVALID CITY CHARACTER"
  },
  errorMessage: "CITY IS REQUIRED"
};

module.exports.address = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\(\\)\\-\\:\\,\\&\\.]*$"],
    errorMessage: "INVALID ADDRESS CHARACTER"
  },
  errorMessage: "ADDRESS IS REQUIRED"
};

module.exports.zip = {
  notEmpty: true,
  isPostalCode: {
    options: ["any"],
    errorMessage: "INVALID ZIP CODE"
  },
  errorMessage: "ZIP CODE IS REQUIRED"
};

module.exports.zipoptional = {
  optional: true,
  isPostalCode: {
    options: ["IN"],
    errorMessage: "INVALID ZIP CODE"
  }
};

module.exports.mobile = {
  notEmpty: true,
  isMobilePhone: true,
  errorMessage: "INVALID OR EMPTY CONTACT NUMBER"
};

module.exports.mobileoptional = {
  optional: true,
  isMobilePhone: true,
  errorMessage: "INVALID CONTACT NUMBER"
};

module.exports.license = {
  optional: true,
  matches: {
    options: ["^[a-zA-Z 0-9]*$"],
    errorMessage: "INVALID LICENSE CHARACTER"
  }
};

module.exports.licexpdate = {
  optional: true,
  matches: {
    options: ["^\\d{2}/\\d{2}/\\d{4}$"],
    errorMessage: "INVALID LICENSE EXPIRY DATE CHARACTER"
  }
};

module.exports.state = {
  notEmpty: true,
  matches: {
    options: ["^[a-z A-Z]*$"],
    errorMessage: "INVALID STATE CHARACTER"
  },
  errorMessage: "STATE IS REQUIRED"
};

module.exports.stateoptional = {
  optional: true,
  matches: {
    options: ["^[a-z A-Z]*$"],
    errorMessage: "INVALID STATE CHARACTER"
  }
};

module.exports.country = {
  notEmpty: true,
  matches: {
    options: ["^[a-z A-Z]*$"],
    errorMessage: "INVALID STATE CHARACTER"
  },
  errorMessage: "COUNTRY IS REQUIRED"
};

module.exports.sponsor = {
  optional: true,
  isLength: {
    options: [{ min: 7, max: 7 }],
    errorMessage: "INVALID SPONSOR VALUE"
  },
  matches: {
    options: ["^[a-zA-Z0-9]*$"],
    errorMessage: "INVALID SPONSOR CHARACTER"
  }
};

module.exports.achbank = {
  optional: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\@\\#\\$\\%\\^\\&\\*\\_\\-\\+]*$"],
    errorMessage: "INVALID BANK NAME CHARACTERS"
  }
};

module.exports.achacntname = {
  optional: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\@\\#\\$\\%\\^\\&\\*\\_\\-\\+]*$"],
    errorMessage: "INVALID ACCOUNT NAME CHARACTERS"
  }
};

module.exports.achaccount = {
  optional: true,
  matches: {
    options: ["^[0-9]*$"],
    errorMessage: "INVALID ACCOUNT NO. CHARACTERS"
  }
};

module.exports.abanumber = {
  optional: true,
  isAlphanumeric: true,
  errorMessage: "INVALID ABA NUMBER"
};

module.exports.achacnttype = {
  optional: true,
  matches: {
    options: [/\b(?:savings|checking)\b/],
    errorMessage: "INVALID ACCOUNT TYPE"
  }
};

module.exports.achemail = {
  optional: true,
  isEmail: true,
  errorMessage: "INVALID ACH EMAIL ID"
};

module.exports.achacntusage = {
  optional: true,
  matches: {
    options: [/\b(?:business|personal)\b/],
    errorMessage: "INVALID ACCOUNT USAGE"
  }
};

module.exports.description = {
  optional: true,
  matches: {
    options: ["^[a-zA-z 0-9\\,\\.\\&\\!\\@\\%\\-]*$"],
    errorMessage: "INVALID DESCRIPTION CHARACTERS"
  }
};

module.exports.owner = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9]*$"],
    errorMessage: "INVALID OWNER NAME CHARACTERS"
  },
  errorMessage: "OWNER NAME IS REQUIRED"
};

module.exports.lienholder = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9]*$"],
    errorMessage: "INVALID LIEN HOLDER CHARACTERS"
  },
  errorMessage: "LIEN HOLDER IS REQUIRED"
};

module.exports.tag = {
  optional: true,
  matches: {
    options: ["^[a-zA-z 0-9\\,\\#]*$"],
    errorMessage: "INVALID TAG CHARACTERS"
  }
};

module.exports.notes = {
  optional: true,
  matches: {
    options: ["^[a-zA-z 0-9\\,\\.\\&\\!\\@\\%\\-//$\\(\\)]*$"],
    errorMessage: "INVALID NOTES CHARACTERS"
  }
};

module.exports.usage = {
  notEmpty: true,
  matches: {
    options: [/\b(?:personal-business|rideshare)\b/],
    errorMessage: "INVALID CAR USAGE"
  },
  errorMessage: "CAR USAGE IS REQUIRED"
};

module.exports.carinfo = {
  notEmpty: true,
  isHexadecimal: true,
  errorMessage: "INVALID OR EMPTY CAR INFO"
};

module.exports.year = {
  notEmpty: true,
  isLength: {
    options: [{ min: 4, max: 4 }],
    errorMessage: "INVALID CAR YEAR"
  },
  errorMessage: "CAR YEAR IS REQUIRED"
};

module.exports.vin = {
  notEmpty: true,
  matches: {
    options: ["^(?=.*[0-9])(?=.*[A-z])[0-9A-z-]{17}$"],
    errorMessage: "INVALID VIN"
  },
  errorMessage: "INVALID OR EMPTY VIN"
};

module.exports.vehicle = {
  notEmpty: true,
  isAlphanumeric: true,
  errorMessage: "INVALID OR EMPTY VEHICLE"
};

module.exports.carplate = {
  notEmpty: true,
  isAlphanumeric: true,
  errorMessage: "INVALID OR EMPTY CAR PLATE"
};

module.exports.tolltag = {
  notEmpty: true,
  isAlphanumeric: true,
  errorMessage: "INVALID OR EMPTY TOLL TAG"
};

module.exports.mileage = {
  notEmpty: true,
  isFloat: {
    options: [{ min: 0 }],
    errorMessage: "INVALID MILEAGE DETAILS"
  },
  errorMessage: "INVALID OR EMPTY MILEAGE INFO"
};

module.exports.regexpdate = {
  optional: true,
  matches: {
    options: ["^\\d{2}/\\d{2}/\\d{4}$"],
    errorMessage: "INVALID REGISTRATION EXPIRY DATE CHARACTER"
  }
};

module.exports.price = {
  notEmpty: true,
  isFloat: {
    options: [{ min: 0 }],
    errorMessage: "INVALID PRICE DETAILS"
  },
  errorMessage: "INVALID OR EMPTY PRICE DETAILS"
};

module.exports.metainfo = {
  optional: true,
  matches: {
    options: ["^[a-zA-z 0-9\\,\\.\\&\\!\\@\\%\\-\\|\\©\\;]*$"],
    errorMessage: "INVALID META INFO CHARACTERS"
  },
  isLength: {
    options: [{ max: 255 }],
    errorMessage: "NAME EXCEEDS 255 CHARACTERS"
  }
};

module.exports.verification = {
  notEmpty: true,
  matches: {
    options: [/\b(?:PENDING|PASSED|FAILED)\b/],
    errorMessage: "INVALID VERIFICATION INFO"
  },
  errorMessage: "VERIFICATION INFO IS REQUIRED"
};

module.exports.vehiclestatus = {
  notEmpty: true,
  matches: {
    options: [
      /\b(?:ACTIVE|INACTIVE|SHORT TERM DEACTIVATION|LONG TERM DEACTIVATION)\b/
    ],
    errorMessage: "INVALID VEHICLE STATUS"
  },
  errorMessage: "VEHICLE STATUS REQUIRED"
};

module.exports.percentage = {
  notEmpty: true,
  isFloat: {
    options: [{ min: 0, max: 100 }],
    errorMessage: "INVALID PERCENTAGE DETAILS"
  },
  errorMessage: "PERCENTAGE IS REQUIRED"
};

module.exports.amount = {
  notEmpty: true,
  isFloat: {
    options: [{ min: 0 }],
    errorMessage: "INVALID AMOUNT DETAILS"
  },
  errorMessage: "AMOUNT DETAIL IS REQUIRED"
};

module.exports.location = {
  notEmpty: true,
  matches: {
    options: ["^[a-zA-Z 0-9\\!\\(\\)\\-\\:\\,\\&\\.]*$"],
    errorMessage: "INVALID LOCATION CHARACTER"
  },
  errorMessage: "LOCATION IS REQUIRED"
};

module.exports.date = {
  notEmpty: true,
  matches: {
    options: ["^\\d{2}/\\d{2}/\\d{4}$"],
    errorMessage: "INVALID START/END DATE CHARACTER"
  },
  errorMessage: "START/END DATE IS REQUIRED"
};

module.exports.ownercredit = {
  notEmpty: true,
  isBoolean: true,
  errorMessage: "INVALID OR EMPTY OWNER CREDIT"
};

// options: ["^\\d{1,2}:\\d{1,2}[AP]M$"],
module.exports.time = {
  notEmpty: true,
  matches: {
    options: ["^\\d{1,2}:00[AP]M$"],
    errorMessage: "INVALID TIME CHARACTERS"
  },
  errorMessage: "TIME INFO IS REQUIRED"
};

module.exports.deductible = {
  notEmpty: true,
  isAlphanumeric: true,
  errorMessage: "INVALID OR EMPTY DEDUCTIBLE INFO"
};

module.exports.driver = {
  notEmpty: true,
  isAlphanumeric: true,
  errorMessage: "INVALID OR EMPTY DRIVER INFO"
};

module.exports.reason = {
  optional: true,
  matches: {
    options: ["^[a-zA-z 0-9\\,\\.]*$"],
    errorMessage: "INVALID REASON CHARACTERS"
  }
};

module.exports.key = {
  optional: true,
  matches: {
    options: ["^[a-zA-Z0-9\\_\\-\\$\\.\\/\\+]*$"],
    errorMessage: "INVALID KEY CHARACTER"
  },
  isLength: {
    options: [{ max: 100 }],
    errorMessage: "NAME EXCEEDS 100 CHARACTERS"
  }
};

module.exports.link = {
  optional: true,
  isURL: true,
  errorMessage: "INVALID LINK/URL"
};
