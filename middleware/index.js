const jwt = require("jsonwebtoken");
const config = require("config");
const { MSG_UNAUTHORIZED, MSG_BAD_REQ } = require("../constants/messages");

module.exports = checkAuthenticated = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);
  }

  const token = req.headers.authorization.split("Bearer ")[1];

  try {
    const decodedtoken = jwt.verify(token, config.get("secret"));
    req.email = decodedtoken.email;
    next();
  } catch (_) {
    return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
  }
};
