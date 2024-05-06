// Import required modules
const logger = require( '../lib/logger.js' );
const helper = require( '../lib/helper.js' );
const createPDFBase = require( '../lib/createPDF.js' );
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
			metadata: req.body.fileInfo.fileId,
			codeFile: 'pdf.js',
		})
		const data = req.body;
		// Generate PDF filename based on file ID and entry date
		const pdfFilename = `${data.fileInfo.fileId.split('.').slice(0, -1).join('')}_${helper.convertDate(data.entry.date)}.pdf`;		
		
		// Create the PDF
		if (data) {
			try
			{
				// Generate PDF content
				const pdfAsBytes = await createPDFBase( data );
				// Create directory if it doesn't exist and write PDF file
				const dir = path.join(__dirname, 'tmp');
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
				fs.writeFileSync(path.join(dir, pdfFilename), pdfAsBytes);

			} catch ( error )
			{
				// Log error if PDF creation fails and send error response
				logger.error( {
					message: `An error occurred while trying to get the PDF doc.${error.message}`, metadata: error.stack,
					codeFile: 'pdf.js',
				} );
				if (!res.headersSent) res.status(500).send('An error occurred while trying to get the PDF doc.');
			}

			// Send PDF download link
			res.send(`${process.env.BASE_URL}/pdfs/${pdfFilename}`);

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
			logger.error( {
				message: 'An error occurred while trying to send.', metadata: { error },
				codeFile: 'pdf.js'} );
			res.status(500).send('An error occurred while trying to send.');
		}
	} // finally {
		// Send any pending logs
		// await logger.sendLogArray();
//	}
});

module.exports = router;