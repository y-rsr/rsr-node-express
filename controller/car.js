const fs = require("fs");

const {
  carSchema,
  carlistSchema,
  updatePropertySchema
} = require("../validator/carSchema");

const {
  MSG_BAD_REQ,
  MSG_CAR_UPDT,
  MSG_CAR_ADDED,
  MSG_INVALID_ID,
  MSG_SERVER_ERR,
  MSG_CAR_DELETED,
  MSG_INVALID_YEAR,
  MSG_INVALID_DATE,
  MSG_UNAUTHORIZED,
  MSG_SIM_DATA_EXISTS
} = require("../constants/messages");

const {
  CAR,
  LIEN,
  ACTIVE,
  DRIVER,
  INACTIVE,
  TYPELESS,
  VERFPENDING,
  CARATTRIBUTE
} = require("../constants/appconstants");

const {
  isValidDate,
  getUploadedFile,
  createExportReport,
  checkAdminHasAccess
} = require("../functions");

const {
  createOne,
  findDocument,
  listOneDocument,
  listAllDocuments,
  deleteOneDocument,
  updateOneDocument,
  processQueryWithSkipAndLimit
} = require("../model");

//access private and privileged.
exports.createCar = async (req, res) => {
  req.checkBody(carSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 4, "add");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const {
      owner,
      lienholder,
      description,
      tag,
      notes,
      usage,
      carmake,
      carmodel,
      year,
      vin,
      vehicle,
      carplate,
      tolltag,
      currentmileage,
      dailymileage,
      regexpdate,
      dailyprice,
      weeklyprice,
      monthlyprice,
      status,
      house,
      street,
      city,
      state,
      zip,
      feature,
      metatitle,
      metakeywords,
      metadescription
    } = req.body;

    const isRegDateValid = isValidDate(TYPELESS, regexpdate);
    if (!isRegDateValid)
      return res.status(400).json([{ msg: MSG_INVALID_DATE }]);

    const isValidOwner = listOneDocument(owner, DRIVER);

    const isValidLienHolder = listOneDocument(lienholder, LIEN);

    const isValidCarMake = listOneDocument(carmake, CARATTRIBUTE);

    const isValidCarModel = listOneDocument(carmodel, CARATTRIBUTE);

    const isValidVin = findDocument({ vin }, CAR);

    const isValidVehicle = findDocument({ vehicle }, CAR);

    const isValidPlate = findDocument({ carplate }, CAR);

    const isValidTollTag = findDocument({ tolltag }, CAR);

    const result = await Promise.all([
      isValidOwner,
      isValidLienHolder,
      isValidCarMake,
      isValidCarModel,
      isValidVin,
      isValidVehicle,
      isValidPlate,
      isValidTollTag
    ]);

    if (
      result[0] === null ||
      result[1] === null ||
      result[2] === null ||
      result[3] === null ||
      result[4] !== null ||
      result[5] !== null ||
      result[6] !== null ||
      result[7] !== null ||
      result[0].type === DRIVER
    )
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const validStartYear = parseInt(result[3].year);
    const today = new Date();
    const currentYear = today.getFullYear();

    if (year < validStartYear || year > currentYear)
      return res.status(400).json([{ msg: MSG_INVALID_YEAR }]);

    let { files } = req;
    let regimageUri = "";
    let ublyimageUri = "";
    if (files.regCert !== undefined) {
      regimageUri = await getUploadedFile(files.regCert[0]);
    }
    if (files.uberLyftCert !== undefined) {
      ublyimageUri = await getUploadedFile(files.uberLyftCert[0]);
    }

    const ownername = result[0].name;
    const ownerstatus = ACTIVE;
    const lienholdername = result[1].firstname + " " + result[1].lastname;
    const make = result[2].name;
    const model = result[3].name;

    const carData = {
      ownername,
      lienholdername,
      description: description === undefined ? "" : description,
      tag: tag === undefined ? "" : tag,
      notes: notes === undefined ? "" : notes,
      usage,
      make,
      model,
      year: String(year),
      vin: String(vin),
      vehicle: String(vehicle),
      carplate: String(carplate),
      tolltag: String(tolltag),
      currentmileage: Number(currentmileage),
      regexpdate: new Date(regexpdate),
      dailymileage: Number(dailymileage),
      regcert: regimageUri,
      ublycert: ublyimageUri,
      dailyprice: Number(dailyprice),
      weeklyprice: Number(weeklyprice),
      monthlyprice: Number(monthlyprice),
      status,
      house: house === undefined ? "" : house,
      street,
      city: String(city).toLowerCase(),
      state,
      zip,
      feature,
      metatitle: metatitle === undefined ? "" : metatitle,
      metakeywords: metakeywords === undefined ? "" : metakeywords,
      metadescription: metadescription === undefined ? "" : metadescription,
      ownerstatus,
      verification: VERFPENDING,
      created: Date.now()
    };

    await createOne(carData, CAR);
    return res.status(201).json([{ msg: MSG_CAR_ADDED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//access private and privileged.
exports.listCars = async (req, res) => {
  req.checkBody(carlistSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 4, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let queryParam = {};
    let { skip, limit, order, field, search, type } = req.body;

    if (type === INACTIVE.toLowerCase()) queryParam = { driver: null };
    else if (type === ACTIVE.toLowerCase())
      queryParam = { driver: { $type: "string" } };

    if (search !== undefined) {
      let value = String(search).toLowerCase();
      queryParam.$or = [
        { vin: { $regex: `.*${value}.*` } },
        { city: { $regex: `.*${value}.*` } },
        { make: { $regex: `.*${value}.*` } },
        { model: { $regex: `.*${value}.*` } },
        { driver: { $regex: `.*${value}.*` } },
        { tolltag: { $regex: `.*${value}.*` } },
        { vehicle: { $regex: `.*${value}.*` } },
        { carplate: { $regex: `.*${value}.*` } },
        { ownername: { $regex: `.*${value}.*` } }
      ];
    }

    const carList = await processQueryWithSkipAndLimit(
      skip,
      limit,
      order,
      field,
      queryParam,
      CAR
    );

    return res.status(200).json(carList);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//View a single car, access private and privileged.
exports.getCar = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 4, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const car = await listOneDocument(id, CAR);
    if (!car) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    return res.status(200).json(car);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//access private and privileged.
exports.editCar = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(carSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const {
    owner,
    lienholder,
    description,
    tag,
    notes,
    usage,
    carmake,
    carmodel,
    year,
    vin,
    vehicle,
    carplate,
    tolltag,
    currentmileage,
    dailymileage,
    regexpdate,
    regcert,
    ublycert,
    dailyprice,
    weeklyprice,
    monthlyprice,
    status,
    house,
    street,
    city,
    state,
    zip,
    feature,
    metatitle,
    metakeywords,
    metadescription
  } = req.body;

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 4, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    const isRegDateValid = isValidDate(TYPELESS, regexpdate);
    if (!isRegDateValid) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const car = listOneDocument(id, CAR);

    const isValidOwner = listOneDocument(owner, DRIVER);

    const isValidLienHolder = listOneDocument(lienholder, LIEN);

    const isValidCarMake = listOneDocument(carmake, CARATTRIBUTE);

    const isValidCarModel = listOneDocument(carmodel, CARATTRIBUTE);

    const isValidVin = findDocument({ vin }, CAR);

    const isValidVehicle = findDocument({ vehicle }, CAR);

    const isValidPlate = findDocument({ carplate }, CAR);

    const isValidTollTag = findDocument({ tolltag }, CAR);

    const result = await Promise.all([
      car,
      isValidOwner,
      isValidLienHolder,
      isValidCarMake,
      isValidCarModel,
      isValidVin,
      isValidVehicle,
      isValidPlate,
      isValidTollTag
    ]);

    if (!result[0]) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    if (
      result[1] === null ||
      result[2] === null ||
      result[3] === null ||
      result[4] === null ||
      (result[5] !== null && result[5]._id != id) ||
      (result[6] !== null && result[6]._id != id) ||
      (result[7] !== null && result[7]._id != id) ||
      (result[8] !== null && result[8]._id != id)
    )
      return res.status(400).json([{ msg: MSG_SIM_DATA_EXISTS }]);

    const validStartYear = parseInt(result[3].year);
    const today = new Date();
    const currentYear = today.getFullYear();

    if (year < validStartYear || year > currentYear)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let { files } = req;
    let regimageUri = regcert;
    let ublyimageUri = ublycert;
    if (files.regCert !== undefined) {
      regimageUri = await getUploadedFile(files.regCert[0]);
    }
    if (files.uberLyftCert !== undefined) {
      ublyimageUri = await getUploadedFile(files.uberLyftCert[0]);
    }

    const ownername = result[1].name;
    const lienholdername = result[2].firstname + " " + result[2].lastname;
    const make = result[3].name;
    const model = result[4].name;

    const carData = {
      ownername,
      lienholdername,
      description: description === undefined ? "" : description,
      tag: tag === undefined ? "" : tag,
      notes: notes === undefined ? "" : notes,
      usage,
      make,
      model,
      year: String(year),
      vin: String(vin),
      vehicle: String(vehicle),
      carplate: String(carplate),
      tolltag: String(tolltag),
      currentmileage: Number(currentmileage),
      regexpdate: new Date(regexpdate),
      dailymileage: Number(dailymileage),
      regcert: regimageUri,
      ublycert: ublyimageUri,
      dailyprice: Number(dailyprice),
      weeklyprice: Number(weeklyprice),
      monthlyprice: Number(monthlyprice),
      status,
      house: house === undefined ? "" : house,
      street,
      city: String(city).toLowerCase(),
      state,
      zip,
      feature,
      metatitle: metatitle === undefined ? "" : metatitle,
      metakeywords: metakeywords === undefined ? "" : metakeywords,
      metadescription: metadescription === undefined ? "" : metadescription
    };

    await updateOneDocument(id, carData, CAR);
    return res.status(200).json([{ msg: MSG_CAR_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//access private and privileged.
exports.deleteCar = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let adminhasaccess = checkAdminHasAccess(req.email, 4, "delete");
    let car = listOneDocument(id, CAR);
    let result = await Promise.all([adminhasaccess, car]);

    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);
    if (!result[1]) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    await deleteOneDocument(id, CAR);
    return res.status(200).json([{ msg: MSG_CAR_DELETED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//access private and privileged.
exports.updateProperty = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    req.checkBody(updatePropertySchema);
    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let adminhasaccess = checkAdminHasAccess(req.email, 4, "edit");
    let docExists = listOneDocument(id, CAR);
    let result = await Promise.all([adminhasaccess, docExists]);

    if (!result[0]) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    if (!result[1]) return res.status(400).json([{ msg: MSG_INVALID_ID }]);

    let { verification, vehiclestatus } = req.body;
    let data = { status: vehiclestatus, verification };

    await updateOneDocument(id, data, CAR);
    return res.status(200).json([{ msg: MSG_CAR_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//access private and privileged.
exports.createCSVFile = async (req, res) => {
  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 4, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let headers = [
      { id: "make", title: "Carmake" },
      { id: "model", title: "carmodel" },
      { id: "year", title: "Caryear" },
      { id: "vin", title: "VIN#" },
      { id: "vehicle", title: "Vehicle#" },
      { id: "currentmileage", title: "Mileage" },
      { id: "created", title: "Registered Date" },
      { id: "ownername", title: "Owner" },
      { id: "city", title: "City" },
      { id: "verification", title: "Verification" },
      { id: "status", title: "Status" },
      { id: "ownerstatus", title: "Owner Status" }
    ];

    let docLists = await listAllDocuments(CAR);
    docLists.forEach(doc => {
      doc.created = new Date(doc.created).toDateString();
    });

    let filepath = await createExportReport(headers, docLists);
    return res.status(200).json({ filepath });
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.exportCSVFile = async (req, res) => {
  try {
    let { filepath } = req.query;
    if (!filepath) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    const readStream = fs.createReadStream(filepath, "utf8");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment;filename="car_list.csv"');
    readStream.pipe(res);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
