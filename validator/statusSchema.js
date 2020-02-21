const { status } = require("../validator");

module.exports = statusSchema = {
  "subadmin.*": {
    notEmpty: true,
    matches: {
      options: ["^[a-zA-z 0-9]*$"],
      errorMessage: "INVALID SUBADMIN ID CHARACTER"
    },
    errorMessage: "SUBADMIN ID IS REQUIRED"
  },
  status
};
