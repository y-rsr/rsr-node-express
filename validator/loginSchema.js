const {
  emailoptional,
  usernameoptional,
  password,
  passwordoptional
} = require("../validator");

module.exports.adminLoginSchema = {
  email: emailoptional,
  username: usernameoptional,
  password: passwordoptional
};

module.exports.loginSchema = {
  email: emailoptional,
  username: usernameoptional,
  password
};
