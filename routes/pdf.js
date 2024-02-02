
const logger = require( '../lib/logger.js' );
const createPDFBase = require( '../lib/createPDF.js' );
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.post('/', async function (req, res, next) {
	try {
		logger.info({
			message: 'POST /pdf called',
			metadata: req.body,
			codeFile: 'pdf.js',
		})
		const data = req.body;
		const pdfFilename = `${data.fileInfo.fileId.split('.').slice(0, -1).join('')}.pdf`;		
		
		// Create the PDF
		if (data) {
			try
			{
				const pdfAsBytes = await createPDFBase( data );
				const dir = path.join(__dirname, 'tmp');
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
				fs.writeFileSync(path.join(dir, pdfFilename), pdfAsBytes);

			} catch ( error )
			{
				logger.error( {
					message: `An error occurred while trying to get the PDF doc.${error.message}`, metadata: error.stack,
					codeFile: 'pdf.js',
				} );
				if (!res.headersSent) res.status(500).send('An error occurred while trying to get the PDF doc.');
			}

			
			res.send(`${process.env.BASE_URL}/pdfs/${pdfFilename}`);

		} else {
			logger.error({
				message: 'No data provided',
			});
			if (!res.headersSent) res.status(500).send('No data provided');
		}
	} catch (error) {
		if (!res.headersSent) {
			console.log(error);
			logger.error( {
				message: 'An error occurred while trying to send.', metadata: { error },
			codeFile: 'pdf.js'} );
			res.status(500).send('An error occurred while trying to send.');
		}
	} finally {
		await logger.sendLogArray();
	}
});

module.exports = router;
