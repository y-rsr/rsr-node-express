const {
  description,
  tag,
  notes,
  usage,
  carinfo,
  year,
  vin,
  vehicle,
  carplate,
  tolltag,
  mileage,
  regexpdate,
  price,
  status,
  houseoptional,
  street,
  city,
  state,
  zip,
  link,
  metainfo,
  verification,
  vehiclestatus
} = require("./index");

module.exports.carSchema = {
  owner: {
    notEmpty: true,
    isHexadecimal: true,
    errorMessage: "INVALID OR EMPTY OWNER ID"
  },
  lienholder: {
    notEmpty: true,
    isHexadecimal: true,
    errorMessage: "INVALID OR EMPTY LIEN HOLDER ID"
  },
  description,
  tag,
  notes,
  usage,
  carmake: carinfo,
  carmodel: carinfo,
  year,
  vin,
  vehicle,
  carplate,
  tolltag,
  currentmileage: mileage,
  dailymileage: mileage,
  regexpdate,
  dailyprice: price,
  weeklyprice: price,
  monthlyprice: price,
  status,
  house: houseoptional,
  street,
  city,
  state,
  zip,
  "feature.*": {
    optional: true,
    matches: {
      options: ["^[a-zA-z 0-9]*$"],
      errorMessage: "INVALID FEATURE CHARACTER"
    }
  },
  metatitle: metainfo,
  metakeywords: metainfo,
  metadescription: metainfo,
  regcert: link,
  ublycert: link
};

module.exports.updatePropertySchema = {
  verification,
  vehiclestatus
};

module.exports.carlistSchema = {
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
        /\b(?:make|vin|vehicle|carplate|tolltag|currentmileage|created|ownername|city|driver|verification|ownerstatus)\b/
      ],
      errorMessage: "INVALID SORT FIELD DETAIL"
    },
    errorMessage: "SORT FIELD DETAIL IS REQUIRED"
  },
  type: {
    notEmpty: true,
    matches: {
      options: [/\b(?:active|inactive|all)\b/],
      errorMessage: "INVALID CAR TYPE LISTING"
    },
    errorMessage: "CAR TYPE LISTING IS REQUIRED"
  }
};
