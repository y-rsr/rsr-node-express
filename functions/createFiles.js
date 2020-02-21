const uuid = require("uuid");
const path = require("path");
const os = require("os");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const {
  headerowneragreement,
  subheaderagreement,
  firstclausehead,
  firstclause,
  secondclausehead,
  secondclause,
  thirdclausehead,
  thirdclause,
  fourthclausehead,
  fourthclause,
  fifthclausehead,
  fifthclause,
  sixthclausehead,
  sixthclause,
  seventhclausehead,
  seventhclause,
  eigthclausehead,
  eigthclause,
  ninethclausehead,
  ninethclause,
  tenthclausehead,
  tenthclause,
  eleventhclausehead,
  eleventhclause,
  italicised,
  endclause
} = require("../public/assets/owneragreement");

exports.createOwnerAgreement = async name => {
  try {
    const doc = new PDFDocument();
    let fileid = uuid.v4();
    let filepath = path.join(os.tmpdir(), String(fileid + ".pdf"));
    doc.pipe(fs.createWriteStream(filepath));
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(headerowneragreement, {
        width: 480,
        align: "center"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(subheaderagreement, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(firstclausehead(name), {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(firstclause(name), {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(secondclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(secondclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(thirdclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(thirdclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(fourthclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(fourthclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(fifthclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(fifthclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(sixthclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(sixthclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(seventhclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(seventhclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Oblique")
      .fontSize(12)
      .text(italicised, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(eigthclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(eigthclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(ninethclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(ninethclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(tenthclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(tenthclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(eleventhclausehead, {
        width: 480,
        align: "left"
      })
      .font("Helvetica")
      .fontSize(12)
      .text(eleventhclause, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(endclause(name), {
        width: 480,
        align: "left"
      });
    doc.end();
    return filepath;
  } catch (e) {
    throw e.message;
  }
};

exports.createDMV = async driver => {
  try {
    const doc = new PDFDocument();
    let fileid = uuid.v4();
    let filepath = path.join(os.tmpdir(), String(fileid + ".pdf"));
    doc.pipe(fs.createWriteStream(filepath));
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Information", {
        width: 480,
        align: "center",
        margins: {
          top: 50
        },
        lineGap: 50
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("FirstName: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.firstname, {
        width: 480,
        align: "left"
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Lastname: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.lastname, {
        width: 480,
        align: "left",
        lineGap: 10
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Address: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.house + ", " + driver.street, {
        width: 480,
        align: "left",
        lineBreak: true
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Phone number: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.mobile, {
        width: 480,
        align: "left",
        lineGap: 10
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("zip: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.zip, {
        width: 480,
        align: "left",
        lineBreak: true
      })

      .font("Helvetica-Bold")
      .fontSize(12)
      .text("City: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.city, {
        width: 480,
        align: "left",
        lineGap: 30
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("State: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.state, {
        width: 480,
        align: "left",
        lineBreak: true
      })
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("DOB: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(
        driver.dob.getMonth() +
          "/" +
          driver.dob.getDay() +
          "/" +
          driver.dob.getFullYear(),
        {
          width: 480,
          align: "left",
          lineGap: 40
        }
      )
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("License No.: ", {
        width: 480,
        align: "left",
        continued: true
      })
      .font("Helvetica")
      .fontSize(12)
      .text(driver.license, {
        width: 480,
        align: "left",
        lineBreak: true
      });
    doc.end();
    return filepath;
  } catch (e) {
    throw e.message;
  }
};
