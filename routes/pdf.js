var express = require('express');
var router = express.Router();
const axios = require('axios');

async function handleRead(dldUrl) {
  const resp = await axios.get(dldUrl, { responseType: 'blob' });
  console.log(resp)
  const pdfBuff = Buffer.from(resp.data).toString('base64');
  console.log(pdfBuff)
  return pdfBuff;
}
/* Post Requested Pdf */
router.post('/', function (req, res, next) {
  const dldUrl = req.body.dldUrl;
  handleRead(dldUrl).then((data) => {
    res.json(data);
  });
});

module.exports = router;
