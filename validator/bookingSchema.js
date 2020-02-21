const {
  carinfo,
  driver,
  date,
  time,
  ownercredit,
  deductible,
  name,
  reason
} = require("./index");

module.exports.initbookingSchema = {
  carid: carinfo,
  driverid: driver,
  datefrom: date,
  dateto: date,
  pickuptime: time,
  ownercredit,
  deductibleid: deductible
};

module.exports.extendedbookingSchema = {
  name,
  extenddate: date,
  reason,
  ownercredit
};
