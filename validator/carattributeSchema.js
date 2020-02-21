const { name, description, status, year, link } = require("../validator");

module.exports.carmakeSchema = {
  name,
  description,
  status
};

module.exports.carmodelSchema = {
  make: {
    notEmpty: true,
    isHexadecimal: true,
    errorMessage: "INVALID OR EMPTY CAR MAKE ID"
  },
  name,
  description,
  year,
  status
};

module.exports.carfeatureSchema = {
  name,
  description,
  status,
  image: link
};

module.exports.editMultipleAttributeSchema = {
  "attributes.*": {
    notEmpty: true,
    isHexadecimal: true,
    errorMessage: "INVALID OR EMPTY ATTRIBUTE_ID"
  },
  status
};

module.exports.listAttributeSchema = {
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
      options: [/\b(?:name|status|created|year|make|image)\b/],
      errorMessage: "INVALID SORT FIELD DETAIL"
    },
    errorMessage: "SORT FIELD DETAIL IS REQUIRED"
  }
};
