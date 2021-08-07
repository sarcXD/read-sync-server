var express = require("express");
var router = express.Router();
var pgp = require("pg-promise")(/* options */);
var db = pgp("postgres://readSyncDB:root@localhost:5432/readSyncDB");
const { randomFillSync } = require("crypto");
const { Buffer } = require("buffer");

// pdf_entry = {
//   id: '',
//   curr_page: 1,
//   pdf_link: '',
//   email: '',
//   last_updated: '',
// }
/**
 * Function creates new record or updates existing record in opened_pdf table
 * @param {pdfDetails} Object containing details to update or create new record using
 * @returns {statusCode} http status of record entry
 */
async function createOpenedPdf(pdfDetails) {
  const buf = Buffer.alloc(15);
  randomFillSync(buf, 0);
  const uId = buf.toString("hex");
  const currPage = 1;
  const pdf_link = pdfDetails.pdfLink;
  const email = pdfDetails.email;

  if (email?.length && pdf_link?.length) {
    const cDate = new Date();
    const last_updated = cDate.toISOString();
    return db
      .none(
        "INSERT INTO opened_pdfs(id, curr_page, pdf_link, email, last_updated) VALUES($1,$2,$3,$4,$5);",
        [uId, currPage, pdf_link, email, last_updated]
      )
      .then(() => {
        // 200 OK
        return { status: "200 OK" };
      })
      .catch((error) => {
        console.log("ERROR:", error);
        return { status: "500 Internal Server Error" };
      });
  }
  return {
    status: "406 Not Acceptable",
    details: "Missing Email or PdfLink entry",
  };
}

/* Post New Pdf */
/**
 * PDF Details
 * pdfLink: Link of firebase storage where pdf is hosted
 * email: Email id of user that has opened new pdf
 */
router.post("/new_pdf", function (req, res, next) {
  const pdfDetails = req.body.pdfDetails;
  console.log("pdfDetails", pdfDetails);
  createOpenedPdf(pdfDetails).then((status) => {
    res.json(status);
  });
});

// pdf_entry = {
//   id: '',
//   curr_page: 1,
//   pdf_link: '',
//   email: '',
//   last_updated: '',
// }
/**
 * Function updates existing record opened_pdf table for newly opened pdf
 * @param {pdfDetails} Object containing details to update or create new record using
 * @returns {statusCode} http status of record entry
 */
 async function updateOpenedPdf(pdfDetails) {
  const pdf_link = pdfDetails.pdfLink;
  const email = pdfDetails.email;
  const currPage = 1;
  if (email?.length && pdf_link?.length) {
    const cDate = new Date();
    const last_updated = cDate.toISOString();
    return db
      .none(
        "UPDATE opened_pdfs SET pdf_link=$1, curr_page=$2, email=$3, last_updated=$4 \
        WHERE email = $3;",
        [pdf_link, currPage, email, last_updated]
      )
      .then(() => {
        // 200 OK
        return { status: "200 OK" };
      })
      .catch((error) => {
        console.log("ERROR:", error);
        return { status: "500 Internal Server Error" };
      });
  }
  return {
    status: "406 Not Acceptable",
    details: "Missing Email or PdfLink entry",
  };
}

/* Post Update Opened Pdf */
/**
 * pdfDetails:
 * email: Email id of user
 * pdfLink: Path of new opened pdf
 */
 router.post("/update_pdf_entry", function (req, res, next) {
  const pdfDetails = req.body.pdfDetails;
  console.log("pdfDetails | Update Pdf Entry", pdfDetails);
  updateOpenedPdf(pdfDetails).then((status) => {
    res.json(status);
  });
});

// user_entry = {
//   email: '',
//   display_name: '',
// }
/**
 * Function creates new record or updates existing record in users table
 * @param {userDetails} Object containing user details to update or create new record using
 * @returns {statusCode} http status of record entry
 */
async function createOrUpdateUser(userDetails) {
  const email = userDetails.email;
  const display_name = userDetails.displayName;
  if (email?.length) {
    const cDate = new Date();
    const login_date = cDate.toISOString();
    // @mark TODO: Understand this big brain query
    return db
      .one(
        "WITH \
          upd_op AS (UPDATE users SET last_login = ${login_date} where email = ${email} RETURNING *), \
          insrt_op AS (INSERT INTO \
               USERS(email, date_created, display_name, last_login) \
               SELECT ${email},${login_date},${display_name},${login_date} \
               WHERE \
                 NOT EXISTS(SELECT * FROM upd_op) \
               RETURNING * \
              ) \
        SELECT * from upd_op \
        UNION \
        SELECT * from insrt_op;",
        {
          login_date: login_date,
          email: email,
          display_name: display_name,
        }
      )
      .then((data) => {
        // 200 OK
        return { status: "200 OK" };
      })
      .catch((error) => {
        console.log("ERROR:", error);
        return { status: "500 Internal Server Error" };
      });
  }
  return { status: "406 Not Acceptable", details: "Missing Email entry" };
}

/* Post New User */
/**
 * User Details
 * email: Email id of user that has signed in
 * displayName: Display name of the user
 */
router.post("/create_user", function (req, res, next) {
  const userDetails = req.body.userDetails;
  console.log("userDetails", userDetails);
  createOrUpdateUser(userDetails).then((status) => {
    res.json(status);
  });
});

async function fetchOpenedPdf(email) {
  if (email?.length) {
    return db
      .any("SELECT curr_page, pdf_link FROM opened_pdfs WHERE email = $1;", [
        email,
      ])
      .then((fetchedState) => {
        if (fetchedState) {
          return {currPage: fetchedState?.curr_page, pdfLink: fetchedState?.pdf_link};
        } else {
          return {}
        }
      })
      .catch((error) => {
        console.log("ERROR:", error);
        return { status: "500 Internal Server Error" };
      });
  }
  return {
    status: "406 Not Acceptable",
    details: "Missing Email",
  };
}

/* Post Resume Reading */
/**
 * email: Email id of user trying to resume reading
 */
router.post("/resume", function (req, res, next) {
  const email = req.body.email;
  console.log("email", email);
  fetchOpenedPdf(email).then((lastPdfState) => {
    res.json(lastPdfState);
  });
});

module.exports = router;
