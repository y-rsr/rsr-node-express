const {
  carmakeSchema,
  carmodelSchema,
  carfeatureSchema,
  listAttributeSchema,
  editMultipleAttributeSchema
} = require("../validator/carattributeSchema");

const { checkAdminHasAccess } = require("../functions");

const {
  MSG_SUCCESS,
  MSG_BAD_REQ,
  MSG_ATR_UPDT,
  MSG_ATR_ADDED,
  MSG_SERVER_ERR,
  MSG_INVALID_ID,
  MSG_ATR_DELETED,
  MSG_UNAUTHORIZED,
  MSG_SIM_DATA_EXISTS
} = require("../constants/messages");
const {
  ACTIVE,
  CARMAKE,
  CARMODEL,
  INACTIVE,
  CARFEATURE,
  CARATTRIBUTE
} = require("../constants/appconstants");

const {
  createOne,
  findDocument,
  listOneDocument,
  updateOneDocument,
  deleteOneDocument,
  deleteMultipleDocuments,
  updateMultipleDocuments,
  processQueryWithSkipAndLimit
} = require("../model");

const { getUploadedFile } = require("../functions");

//Add Car make or model, access private and privileged.
exports.addCarAttribute = async (req, res) => {
  const attribute = req.params.attribute;
  if (attribute !== CARMAKE && attribute !== CARMODEL)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (attribute === CARMAKE) req.checkBody(carmakeSchema);
  else req.checkBody(carmodelSchema);

  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const { name, description, status } = req.body;
  let make, year;
  if (attribute === CARMODEL) {
    make = req.body.make;
    year = req.body.year;
  }

  let cardata = {
    name: String(name).toLowerCase(),
    description: description === undefined ? "" : description,
    status,
    type: attribute,
    created: Date.now()
  };

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "add");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    if (attribute === CARMAKE) {
      let isPresent = await findDocument(
        { name: String(name).toLowerCase(), type: attribute },
        CARATTRIBUTE
      );

      if (isPresent)
        return res.status(400).json([{ msg: MSG_SIM_DATA_EXISTS }]);
    } else {
      let carmake = await listOneDocument(make, CARATTRIBUTE);
      if (!carmake || carmake.type !== CARMAKE)
        return res.status(400).json([{ msg: MSG_INVALID_ID }]);

      let carmodel = await findDocument(
        {
          name: String(name).toLowerCase(),
          make: carmake.name,
          type: CARMODEL
        },
        CARATTRIBUTE
      );
      if (carmodel) return res.status(400).json([{ msg: MSG_SIM_DATA_EXISTS }]);

      cardata.make = carmake.name;
      cardata.year = year;
    }

    await createOne(cardata, CARATTRIBUTE);
    return res.status(201).json([{ msg: MSG_ATR_ADDED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//List a prticular attribute category, access private and privileged
exports.listCarAttributes = async (req, res) => {
  const attribute = req.params.attribute;
  if (
    attribute !== CARMAKE &&
    attribute !== CARMODEL &&
    attribute !== CARFEATURE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(listAttributeSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const { skip, limit, order, field, search } = req.body;

  let queryParam = { type: attribute };
  if (search !== undefined) {
    let value = String(search).toLowerCase();
    queryParam.name = { $regex: `.*${value}.*` };
  }

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "view");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let carattributeList = await processQueryWithSkipAndLimit(
      skip,
      limit,
      order,
      field,
      queryParam,
      CARATTRIBUTE
    );
    return res.status(200).json(carattributeList);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//View a specific car attribute, access private and privileged.
exports.getCarAttribute = async (req, res) => {
  const { id, attribute } = req.params;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (
    attribute !== CARMAKE &&
    attribute !== CARMODEL &&
    attribute !== CARFEATURE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "view");
    if (!adminhasaccess)
      return res.status(400).json([{ msg: MSG_UNAUTHORIZED }]);

    let carAttribute = await listOneDocument(id, CARATTRIBUTE);
    if (!carAttribute) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    return res.status(200).json(carAttribute);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Edit Car make and model, access private and privileged.
exports.editCarAttribute = async (req, res) => {
  const { id, attribute } = req.params;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (attribute !== CARMAKE && attribute !== CARMODEL)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (attribute === CARMAKE) req.checkBody(carmakeSchema);
  else req.checkBody(carmodelSchema);

  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const { name, description, status } = req.body;
  const cardata = {
    name,
    description: description === undefined ? "" : description,
    status
  };

  let carmake;
  let caryear;
  if (attribute === CARMODEL) {
    carmake = req.body.make;
    caryear = req.body.year;
  }

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let caratr = await listOneDocument(id, CARATTRIBUTE);
    if (!caratr || caratr.type !== attribute)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    if (attribute === CARMAKE) {
      let atr = await findDocument(
        { name: String(name).toLowerCase(), type: attribute },
        CARATTRIBUTE
      );

      if (atr !== null && atr._id != id)
        return res.status(400).json([{ msg: MSG_SIM_DATA_EXISTS }]);
    } else {
      let make = await listOneDocument(carmake, CARATTRIBUTE);
      if (!make || make.type !== CARMAKE)
        return res.status(400).json([{ msg: MSG_INVALID_ID }]);

      let carmodel = await findDocument(
        {
          name: String(name).toLowerCase(),
          make: make.name,
          type: CARMODEL
        },
        CARATTRIBUTE
      );
      if (carmodel !== null && carmodel._id != id)
        return res.status(400).json([{ msg: MSG_SIM_DATA_EXISTS }]);

      cardata.make = make.name;
      cardata.year = caryear;
    }

    await updateOneDocument(id, cardata, CARATTRIBUTE);
    return res.status(200).json([{ msg: MSG_ATR_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Change status of multiple car attribute, access privileged and private.
exports.editMultipleCarAttribute = async (req, res) => {
  const attribute = req.params.attribute;
  if (
    attribute !== CARMAKE &&
    attribute !== CARMODEL &&
    attribute !== CARFEATURE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(editMultipleAttributeSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const { attributes, status } = req.body;
  if (attributes === undefined || attributes.length === 0)
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    await updateMultipleDocuments(attributes, { status }, CARATTRIBUTE);
    return res.status(200).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Delete Car Attribute, access private and privileged.
exports.deleteCarAttribute = async (req, res) => {
  const { id, attribute } = req.params;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (
    attribute !== CARMAKE &&
    attribute !== CARMODEL &&
    attribute !== CARFEATURE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "delete");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let carAttribute = await listOneDocument(id, CARATTRIBUTE);
    if (!carAttribute) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    if (carAttribute.type !== attribute)
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    await deleteOneDocument(id, CARATTRIBUTE);
    return res.status(200).json([{ msg: MSG_ATR_DELETED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Delete multiple car attribute, access private and privileged.
exports.deleteMultipleCarAttribute = async (req, res) => {
  let idList = req.query.id;
  if (idList.length === 0) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  const attribute = req.params.attribute;
  if (
    attribute !== CARMAKE &&
    attribute !== CARMODEL &&
    attribute !== CARFEATURE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  let isArray = Array.isArray(idList);
  if (!isArray) {
    idList = [idList];
  }

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "delete");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    await deleteMultipleDocuments(idList, CARATTRIBUTE);
    return res.status(200).json([{ msg: MSG_ATR_DELETED }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Add a car feature, access private and privileged.
exports.addCarFeature = async (req, res) => {
  req.checkBody(carmakeSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const { name, description, status } = req.body;

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "add");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let isPresent = await findDocument(
      { name: String(name).toLowerCase(), type: CARFEATURE },
      CARATTRIBUTE
    );
    if (isPresent) return res.status(400).json([{ msg: MSG_SIM_DATA_EXISTS }]);

    let { file } = req;
    let imageuri = "";
    if (file !== undefined) {
      imageuri = await getUploadedFile(file);
    }

    const carfeature = {
      name: String(name).toLowerCase(),
      description: description === undefined ? "" : description,
      image: imageuri,
      status,
      type: CARFEATURE,
      created: Date.now()
    };

    await createOne(carfeature, CARATTRIBUTE);
    return res.status(201).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Edit a car feature, access private and privileged.
exports.editCarFeature = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody(carfeatureSchema);
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  const { name, description, status, image } = req.body;

  try {
    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let carFeature = await listOneDocument(id, CARATTRIBUTE);
    if (!carFeature) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    let checkfeatureexists = await findDocument(
      { name: String(name).toLowerCase(), type: CARFEATURE },
      CARATTRIBUTE
    );

    if (checkfeatureexists !== null && checkfeatureexists._id != id)
      return res.status(400).json([{ msg: MSG_SIM_DATA_EXISTS }]);

    let { file } = req;
    let imageuri = image;
    if (file !== undefined) {
      imageuri = await getUploadedFile(file);
    }

    let carfeature = {
      name: String(name).toLowerCase(),
      description: description === undefined ? "" : description,
      image: imageuri,
      status
    };

    await updateOneDocument(id, carfeature, CARATTRIBUTE);
    return res.status(200).json([{ msg: MSG_ATR_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

//Change car attribute status, access private and privileged.
exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let adminhasaccess = await checkAdminHasAccess(req.email, 8, "edit");
    if (!adminhasaccess)
      return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

    let attr = await listOneDocument(id, CARATTRIBUTE);
    if (!attr) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    let status = attr.status === ACTIVE ? INACTIVE : ACTIVE;
    await updateOneDocument(id, { status }, CARATTRIBUTE);
    return res.status(200).json([{ msg: MSG_ATR_UPDT }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
