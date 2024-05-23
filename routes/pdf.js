// Import required modules
const logger = require('../lib/logger.js');
const helper = require('../lib/helper.js');
const createPDFBase = require('../lib/createPDF.js');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Handle POST request for creating PDF
router.post('/', async function (req, res, next) {
  try {
    // Log the request information
    logger.info({
      message: 'POST /pdf called',
      codeFile: 'pdf.js',
    });

    const dataArr = req.body;

    // Create the PDF
    if (dataArr) {
      let returnArray = [];
      try {
        // Generate PDF content
        const dataArray = await createPDFBase(dataArr);
        // Create directory if it doesn't exist and write PDF file
        const dir = path.join(__dirname, 'tmp');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        returnArray = await writePDFFiles(dataArray, dir);

        // You can now handle the rejected promises as you see fit
      } catch (error) {
        // Log error if PDF creation fails and send error response
        logger.error({
          message: `An error occurred while trying to get the PDF doc.${error.message}`,
          metadata: error.stack,
          codeFile: 'pdf.js',
        });
        if (!res.headersSent)
          res
            .status(500)
            .send('An error occurred while trying to get the PDF doc.');
      }

      res.send(returnArray);
    } else {
      // Log and send error response if no data provided
      logger.error({
        message: 'No data provided',
      });
      if (!res.headersSent) res.status(500).send('No data provided');
    }
  } catch (error) {
    // Log and send error response for any unexpected errors
    if (!res.headersSent) {
      console.log(error);
      logger.error({
        message: 'An error occurred while trying to send.',
        metadata: { error },
        codeFile: 'pdf.js',
      });
      res.status(500).send('An error occurred while trying to send.');
    }
  }
});

// Function to write PDF files
async function writePDFFiles(dataArray, dir, retries = 0) {
  let returnArray = [];
  // Generate an array of write file promises
  const writePromises = dataArray.map((dataObj, i) => {
    const data = dataObj.extractedData;
    // Generate PDF filename based on file ID and entry date
    const pdfFilename = `${data.fileInfo.fileId
      .split('.')
      .slice(0, -1)
      .join('')}_${helper.convertDate(data.entry.date)}.pdf`;

    // Write file and return promise
    return fs.promises
      .writeFile(path.join(dir, pdfFilename), dataObj.pdfAsBytes)
      .then(() => {
        return {
          pdfUrl: `${process.env.BASE_URL}/pdfs/${pdfFilename}`,
          index: dataObj.index,
        };
      })
      .catch((error) => {
        return {
          status: 'rejected',
          reason: error,
          dataObj: dataObj,
        };
      });
  });

  // Wait for all files to be written
  const results = await Promise.allSettled(writePromises);

  // Separate the results into fulfilled and rejected
  returnArray = results.filter((result) => result.status === 'fulfilled');
  const rejected = results.filter((result) => result.status === 'rejected');

  console.log('Rejected promises:', rejected);

  // Retry rejected promises up to 3 times
  if (retries < 3 && rejected.length > 0) {
    returnArray.push(
      ...(await writePDFFiles(
        rejected.map((r) => r.dataObj),
        dir,
        retries + 1
      ))
    );
  }

  return returnArray;
}

module.exports = router;
