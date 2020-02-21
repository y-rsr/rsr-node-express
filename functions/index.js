const fs = require("fs");
const multer = require("multer");
const path = require("path");
const config = require("config");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const os = require("os");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const s3 = new AWS.S3({
  accessKeyId: config.get("S3_ACCESS_KEY"),
  secretAccessKey: config.get("S3_SECRET_KEY")
});

const { listOneDocument, findDocument } = require("../model");
const {
  CAR,
  FEES,
  ADMIN,
  INSURANCE,
  OWNER,
  BASIC,
  CITYTAXES,
  TOURISM,
  DEPOSITS,
  ACTIVE,
  INSURANCEFEE,
  TRANSACTIONFEE,
  BACKGROUNDFEE,
  BOOKINGS,
  TYPEGREATER
} = require("../constants/appconstants");

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  return cb("Error: Images|PDF Files Only Allowed");
};

exports.upload = upload;

exports.isValidDate = (check, date) => {
  const givenDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (check === TYPEGREATER) {
    if (today > givenDate) {
      return true;
    }
    return false;
  } else {
    if (today < givenDate) {
      return true;
    }
    return false;
  }
};

exports.getUploadedFile = file => {
  return new Promise((resolve, reject) => {
    const img = fs.readFileSync(file.path);
    let filename = file.fieldname + Date.now() + path.extname(file.filename);
    const s3params = {
      Bucket: config.get("S3_BUCKET_NAME"),
      Key: filename,
      Body: img,
      ContentType: file.mimetype,
      ContentLength: file.size,
      ACL: "public-read"
    };

    s3.upload(s3params, (err, data) => {
      if (err) reject(err.message);
      resolve(data.Location);
    });
  });
};

exports.getFareBreakdown = async (vehicleId, deductibleId, days) => {
  try {
    const vehicleData = await listOneDocument(vehicleId, CAR);
    if (!vehicleData) throw ReferenceError("Invalid Document Id");

    const {
      ownername,
      dailyprice,
      weeklyprice,
      monthlyprice,
      city,
      make,
      model,
      year,
      vin
    } = vehicleData;

    //Processing Base Price
    let baseprice = 0;
    if (days >= 30) {
      baseprice =
        Math.floor(days / 30) * monthlyprice +
        Math.floor((days % 30) / 7) * weeklyprice +
        ((days % 30) % 7) * dailyprice;
    } else if (days >= 7) {
      baseprice = Math.floor(days / 7) * weeklyprice + (days % 7) * dailyprice;
    } else {
      baseprice = days * dailyprice;
    }
    console.log("Base Fee", baseprice);

    //Processed insurance fees
    let insurancefee = 0;
    let insData = await findDocument(
      { owner: ownername, city, type: INSURANCE, status: ACTIVE },
      FEES
    );
    if (insData) {
      insurancefee = days * insData.amount;
    } else {
      let insData = await findDocument(
        { owner: ownername, type: OWNER, status: ACTIVE },
        FEES
      );
      if (insData) {
        insurancefee = days * insData.insfeeamnt;
      } else {
        let insData = await findDocument(
          { type: BASIC, name: INSURANCEFEE },
          FEES
        );

        if (!insData) return;
        else insurancefee = days * insData.amount;
      }
    }
    console.log("Insurance Fee", insurancefee);

    //Processed Deductible fees
    let deductibleIns = 0;
    let deductible = await listOneDocument(deductibleId, FEES);
    if (deductible && deductible.status === ACTIVE)
      deductibleIns = days * deductible.price;
    console.log("Deductible Fee", deductibleIns);

    //Processed city taxes
    let cityTaxes = 0;
    let citytax = await findDocument(
      { city, type: CITYTAXES, status: ACTIVE },
      FEES
    );
    if (citytax) cityTaxes = baseprice * (citytax.tax / 100);

    console.log("CityTaxes", cityTaxes);

    //Processing tourism surcharge
    let tourismcharge = 0;
    let tourism = await findDocument(
      { city, type: TOURISM, status: ACTIVE },
      FEES
    );
    if (tourism) tourismcharge = days * tourism.tax;

    console.log("Tourism Surcharge", tourismcharge);
    //Processing deposit fee
    let depositAmount = 0;
    let deposit = await findDocument(
      { city, type: DEPOSITS, status: ACTIVE },
      FEES
    );
    if (deposit) depositAmount = deposit.deposit;

    console.log("Deposit Amnt", depositAmount);

    //Ticket Processing Fee
    let processingFee = 0;
    let ownerData = await findDocument({ owner: ownername, type: OWNER }, FEES);
    if (ownerData && ownerData.trnsfeestatus === ACTIVE)
      processingFee = (ownerData.trnsfeepctg / 100) * baseprice;
    else {
      let commonData = await findDocument(
        { name: TRANSACTIONFEE, type: BASIC },
        FEES
      );
      if (commonData && commonData.status === ACTIVE)
        processingFee = baseprice * (commonData.amount / 100);
    }

    console.log("Processing Fee", processingFee);

    //Background check fee
    let backcheckfee = 0;
    let previousBooking = await findDocument(
      { driver: "__DRIVER NAME___" },
      BOOKINGS
    );
    if (!previousBooking) {
      if (ownerData && ownerData.bkchkfeestatus === ACTIVE)
        backcheckfee = ownerData.bkchkfeeamnt;
      else {
        let checkFee = await findDocument(
          { name: BACKGROUNDFEE, type: BASIC },
          FEES
        );
        if (checkFee) backcheckfee = checkFee.amount;
      }
    }
    console.log("Back check fee", backcheckfee);

    return {
      carinfo: {
        ownername,
        city,
        make,
        model,
        year,
        vin
      },
      priceinfo: {
        baseprice,
        insurancefee,
        deductibleIns,
        cityTaxes,
        tourismcharge,
        depositAmount,
        processingFee,
        backcheckfee
      }
    };
  } catch (e) {
    throw e.message;
  }
};

exports.getExtendedFare = (faredata, tenure, extension) => {
  let baseprice = (faredata.baseprice / tenure) * extension;
  let insurancefee = (faredata.insurancefee / tenure) * extension;
  let deductibleIns = (faredata.deductibleIns / tenure) * extension;
  let cityTaxes = (faredata.cityTaxes / tenure) * extension;
  let tourismcharge = (faredata.tourismcharge / tenure) * extension;
  let processingFee = (faredata.processingFee / tenure) * extension;
  let backcheckfee = 0;
  let deposit = 0;

  return {
    baseprice,
    insurancefee,
    deductibleIns,
    cityTaxes,
    tourismcharge,
    processingFee,
    backcheckfee,
    deposit
  };
};

exports.createExportReport = async (headers, docList) => {
  try {
    let fileid = uuid.v4();
    let filepath = path.join(os.tmpdir(), String(fileid + ".csv"));
    const csvWriter = createCsvWriter({
      path: filepath,
      header: headers
    });
    await csvWriter.writeRecords(docList);
    return filepath;
  } catch (e) {
    throw e.message;
  }
};

exports.checkAdminHasAccess = async (email, index, type) => {
  let admin = await findDocument({ email }, ADMIN);
  if (!admin || (admin.admintype !== ADMIN && !admin.privileges)) return false;

  if (admin.admintype !== ADMIN) {
    let adminhasaccess = admin.privileges[index][type];
    if (!adminhasaccess) return false;
  }

  return true;
};
