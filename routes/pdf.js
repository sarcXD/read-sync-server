var express = require("express");
var router = express.Router();
var fs = require("fs/promises");

async function handleRead() {
  const filePath = "public/pdf/ProofOfTransfer.pdf";
  const fileData = await fs.readFile(filePath, {});

  return fileData;
}
/* Get Requested Pdf */
router.get("/", function (req, res, next) {
  const resData = handleRead();
  resData.then((data) => {
    res.json(data);
  });
});

module.exports = router;
