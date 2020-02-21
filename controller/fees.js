const {
  basicSchema,
  ownerfeeSchema,
  deductiblefeeSchema,
  citytaxSchema,
  depositSchema,
  insuranceSchema
} = require("../validator/feesSchema");

const {
  createOne,
  findDocument,
  processQuery,
  updateOneDocument,
  listOneDocument,
  deleteOneDocument
} = require("../model");
const { status } = require("../validator");
const {
  DRIVER,
  BASIC,
  FEES,
  OWNER,
  DEDUCTIBLE,
  CITYTAXES,
  TOURISM,
  DEPOSITS,
  INSURANCE
} = require("../constants/appconstants");
const {
  MSG_SERVER_ERR,
  MSG_SUCCESS,
  MSG_BAD_REQ,
  MSG_INVALID_ID,
  MSG_UNAUTHORIZED
} = require("../constants/messages");

exports.filterfeeStructure = async (req, res) => {
  const type = req.params.type;
  const value = String(req.query.value).toLowerCase();

  if (
    type !== BASIC &&
    type !== OWNER &&
    type !== DEDUCTIBLE &&
    type !== CITYTAXES &&
    type !== TOURISM &&
    type !== DEPOSITS &&
    type !== INSURANCE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let queryParams = { type };
    if (type === BASIC) queryParams.name = { $regex: `.*${value}.*` };

    if (type === OWNER) queryParams.owner = { $regex: `.*${value}.*` };

    if (
      type === CITYTAXES ||
      type === TOURISM ||
      type === DEPOSITS ||
      type === DEDUCTIBLE ||
      type === INSURANCE
    )
      queryParams.city = { $regex: `.*${value}.*` };

    let basicFeesList = await processQuery(queryParams, FEES);
    return res.status(200).json(basicFeesList);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.listfeeStructure = async (req, res) => {
  const type = req.params.type;
  if (
    type !== BASIC &&
    type !== OWNER &&
    type !== DEDUCTIBLE &&
    type !== CITYTAXES &&
    type !== TOURISM &&
    type !== DEPOSITS &&
    type !== INSURANCE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    let basicFeesList = await processQuery({ type }, FEES);
    return res.status(200).json(basicFeesList);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.changefeeStatus = async (req, res) => {
  const type = req.params.type;
  const id = req.params.id;

  if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  if (
    type !== BASIC &&
    type !== DEDUCTIBLE &&
    type !== CITYTAXES &&
    type !== TOURISM &&
    type !== DEPOSITS &&
    type !== INSURANCE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  req.checkBody({ status });
  const err = req.validationErrors();
  if (err) return res.status(400).json(err);

  try {
    let fee = await listOneDocument(id, FEES);
    if (!fee) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    if (fee.type !== type) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    await updateOneDocument(id, { status: req.body.status }, FEES);
    return res.status(200).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.editfeeStructure = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    if (
      type !== BASIC &&
      type !== OWNER &&
      type !== DEDUCTIBLE &&
      type !== CITYTAXES &&
      type !== TOURISM &&
      type !== DEPOSITS &&
      type !== INSURANCE
    )
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    if (type === BASIC) req.checkBody(basicSchema);

    if (type === OWNER) req.checkBody(ownerfeeSchema);

    if (type === DEDUCTIBLE) req.checkBody(deductiblefeeSchema);

    if (type === CITYTAXES || type === TOURISM) req.checkBody(citytaxSchema);

    if (type === DEPOSITS) req.checkBody(depositSchema);

    if (type === INSURANCE) req.checkBody(insuranceSchema);

    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let feeData;
    if (type === BASIC)
      feeData = {
        name: String(req.body.name).toLowerCase(),
        amount: Number(req.body.amount),
        status: req.body.status
      };

    if (type === OWNER) {
      let ownerData = await listOneDocument(req.body.owner, DRIVER);
      if (!ownerData) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

      feeData = {
        owner: ownerData.name,
        insfeeamnt: Number(req.body.insfeeamnt),
        insfeestatus: req.body.insfeestatus,
        trnsfeepctg: Number(req.body.trnsfeepctg),
        trnsfeestatus: req.body.trnsfeestatus,
        bkchkfeeamnt: Number(req.body.bkchkfeeamnt),
        bkchkfeestatus: req.body.bkchkfeestatus,
        latefeeamnt: Number(req.body.latefeeamnt),
        latefeeshrpctg: Number(req.body.latefeeshrpctg),
        latefeestatus: req.body.latefeestatus,
        ownrcmsnpctg: Number(req.body.ownrcmsnpctg),
        ownrcmsnstatus: req.body.ownrcmsnstatus
      };
    }

    if (type === DEDUCTIBLE)
      feeData = {
        price: Number(req.body.price),
        amount: Number(req.body.amount),
        status: req.body.status
      };

    if (type === CITYTAXES || type === TOURISM)
      feeData = {
        location: req.body.location,
        city: String(req.body.city).toLowerCase(),
        tax: Number(req.body.tax),
        status: req.body.status
      };

    if (type === DEPOSITS) {
      let ownerData = await listOneDocument(req.body.owner, DRIVER);
      if (!ownerData) return res.status(400).json([{ msg: MSG_BAD_REQ }]);
      feeData = {
        owner: ownerData.name,
        location: req.body.location,
        city: String(req.body.city).toLowerCase(),
        deposit: Number(req.body.deposit),
        status: req.body.status
      };
    }

    if (type === INSURANCE) {
      let ownerData = await listOneDocument(req.body.owner, DRIVER);
      if (!ownerData) return res.status(400).json([{ msg: MSG_BAD_REQ }]);
      feeData = {
        owner: ownerData.name,
        location: req.body.location,
        city: String(req.body.city).toLowerCase(),
        amount: Number(req.body.amount),
        status: req.body.status
      };
    }

    let fee = await listOneDocument(id, FEES);
    if (!fee) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    if (fee.type !== type) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    await updateOneDocument(id, feeData, FEES);
    return res.status(200).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.createfeeStructure = async (req, res) => {
  const type = req.params.type;
  if (
    type !== OWNER &&
    type !== DEDUCTIBLE &&
    type !== CITYTAXES &&
    type !== TOURISM &&
    type !== DEPOSITS &&
    type !== INSURANCE
  )
    return res.status(400).json([{ msg: MSG_BAD_REQ }]);

  try {
    if (type === OWNER) req.checkBody(ownerfeeSchema);

    if (type === DEDUCTIBLE) req.checkBody(deductiblefeeSchema);

    if (type === CITYTAXES || type === TOURISM) req.checkBody(citytaxSchema);

    if (type === DEPOSITS) req.checkBody(depositSchema);

    if (type === INSURANCE) req.checkBody(insuranceSchema);

    const err = req.validationErrors();
    if (err) return res.status(400).json(err);

    let feedata;
    if (type === OWNER) {
      let ownerData = await listOneDocument(req.body.owner, DRIVER);
      if (!ownerData) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

      let ownerFees = await findDocument(
        { owner: ownerData.name, type: OWNER },
        FEES
      );
      if (ownerFees) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

      feedata = {
        owner: ownerData.name,
        insfeeamnt: Number(req.body.insfeeamnt),
        insfeestatus: req.body.insfeestatus,
        trnsfeepctg: Number(req.body.trnsfeepctg),
        trnsfeestatus: req.body.trnsfeestatus,
        bkchkfeeamnt: Number(req.body.bkchkfeeamnt),
        bkchkfeestatus: req.body.bkchkfeestatus,
        latefeeamnt: Number(req.body.latefeeamnt),
        latefeeshrpctg: Number(req.body.latefeeshrpctg),
        latefeestatus: req.body.latefeestatus,
        ownrcmsnpctg: Number(req.body.ownrcmsnpctg),
        ownrcmsnstatus: req.body.ownrcmsnstatus,
        type: OWNER
      };
    }

    if (type === DEDUCTIBLE)
      feedata = {
        price: Number(req.body.price),
        amount: Number(req.body.amount),
        status: req.body.status,
        type: DEDUCTIBLE
      };

    if (type === CITYTAXES || type === TOURISM) {
      let data = await findDocument(
        { city: String(req.body.city).toLowerCase(), type },
        FEES
      );
      if (data) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

      feedata = {
        location: req.body.location,
        city: String(req.body.city).toLowerCase(),
        tax: Number(req.body.tax),
        status: req.body.status,
        type: type === CITYTAXES ? CITYTAXES : TOURISM
      };
    }

    if (type === DEPOSITS) {
      let ownerData = await listOneDocument(req.body.owner, DRIVER);
      if (!ownerData) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

      let depositdata = await findDocument(
        {
          owner: ownerData.name,
          city: String(req.body.city).toLowerCase(),
          type
        },
        FEES
      );

      if (depositdata) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

      feedata = {
        owner: ownerData.name,
        location: req.body.location,
        city: String(req.body.city).toLowerCase(),
        deposit: Number(req.body.deposit),
        status: req.body.status,
        type: DEPOSITS
      };
    }

    if (type === INSURANCE) {
      let ownerData = await listOneDocument(req.body.owner, DRIVER);
      if (!ownerData) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

      let insdata = await findDocument(
        {
          owner: ownerData.name,
          city: String(req.body.city).toLowerCase(),
          type
        },
        FEES
      );
      if (insdata) return res.status(401).json([{ msg: MSG_UNAUTHORIZED }]);

      feedata = {
        owner: ownerData.name,
        location: req.body.location,
        city: String(req.body.city).toLowerCase(),
        amount: Number(req.body.amount),
        status: req.body.status,
        type: INSURANCE
      };
    }

    await createOne(feedata, FEES);
    return res.status(201).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};

exports.deletefeeStructure = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!id) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    if (
      type !== OWNER &&
      type !== DEDUCTIBLE &&
      type !== CITYTAXES &&
      type !== TOURISM &&
      type !== DEPOSITS &&
      type !== INSURANCE
    )
      return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    let fee = await listOneDocument(id, FEES);
    if (!fee) return res.status(404).json([{ msg: MSG_INVALID_ID }]);

    if (fee.type !== type) return res.status(400).json([{ msg: MSG_BAD_REQ }]);

    await deleteOneDocument(id, FEES);
    return res.status(200).json([{ msg: MSG_SUCCESS }]);
  } catch (e) {
    console.log(e);
    return res.status(500).json([{ msg: MSG_SERVER_ERR }]);
  }
};
