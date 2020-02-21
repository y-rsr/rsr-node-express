const {
  name,
  percentage,
  status,
  owner,
  amount,
  price,
  location,
  city
} = require("./index");

module.exports.basicSchema = {
  name,
  amount,
  status
};

module.exports.ownerfeeSchema = {
  owner,
  insfeeamnt: amount,
  insfeestatus: status,
  trnsfeepctg: percentage,
  trnsfeestatus: status,
  bkchkfeeamnt: amount,
  bkchkfeestatus: status,
  latefeeamnt: amount,
  latefeeshrpctg: percentage,
  latefeestatus: status,
  ownrcmsnpctg: percentage,
  ownrcmsnstatus: status
};

module.exports.deductiblefeeSchema = {
  price,
  amount,
  status
};

module.exports.citytaxSchema = {
  location,
  city,
  tax: percentage,
  status
};

module.exports.depositSchema = {
  owner,
  location,
  city,
  deposit: amount,
  status
};

module.exports.insuranceSchema = {
  owner,
  location,
  city,
  amount,
  status
};
