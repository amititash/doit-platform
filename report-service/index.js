const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const express = require('express');
const MailPdfReportApi = require('./utils/mailReport');
const ReportProcessorApi = require('./utils/reportProcessor');
const cors = require('cors');
const HTMLGenerator = require('./utils/htmlGenerator');
const reportObjGenerator = require('./utils/reportObjectGenerator');
require('dotenv').config()

const converter = async (obj) => {
  const template = Handlebars.compile(require('./reportHTMLString'));
  const html = template(obj);
  const browser = await puppeteer.launch({args: ['--no-sandbox' , '--disable-setuid-sandbox']});
  const page = await browser.newPage();
//   await page.goto('https://google.com');
  page.setContent(html);
  let pdf = await page.pdf();
  await browser.close();
  return pdf.toString('base64');
}


const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser());
app.use(cors());

app.post('/report', async (req, res) => {
    let responseData  = {
    }
    let obj = {};
    try {
      obj = await ReportProcessorApi.reportProcessor(req.body.user, req.body.ko, req.body.processedKo);
      let base64pdf = await converter(obj);
      let mailResponse = await MailPdfReportApi.sendPdfMail(base64pdf , req.body.receiverEmail);
      responseData.base64pdf = base64pdf;
      responseData.sucess = true;
      responseData.mailResponse = mailResponse
    }

    catch(e){
      console.log(e);
      responseData.sucess = false;
    }
    res.send(responseData);
})



app.get('/reportHTML', async (req, res) => {
  let ko_id = req.query.ko_id;
  let userEmailId = req.query.emailId;  
  console.log("XXXXXXXXXXXXXXXx", req.query)
  let responseData = {};
  let processedReportObj = {};
  try {
    processedReportObj = await reportObjGenerator.generate(ko_id, userEmailId);
    let html = HTMLGenerator.generate(processedReportObj);
    responseData.success = true;
    responseData.html = html;
    responseData.processedReport = processedReportObj;
  }
  catch(e) {
      responseData.success = false;
      responseData.error = e.message;
  }
  res.json(responseData);
})

const port = process.env.PORT || 4044;
const ip = process.env.IP || '0.0.0.0';
app.listen(port , ip, () => {
  console.log(`report api listening on PORT ${port}`)
});
