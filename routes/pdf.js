
const logger = require( '../lib/logger.js' );
const createPDFBase = require( '../lib/createPDF.js' );
var express = require('express');
var router = express.Router();

router.post('/', async function (req, res, next) {
	try {
		console.log('POST /pdf');
		const data = req.body;
/*
		const clientInfo = {
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		};
		const isMe = req.headers['is-it-me'] === 'true';
		*/
		let pdfAsBase64;
		
		// Create the PDF
		if (data) {
			try
			{
				pdfAsBase64 = await createPDFBase( data );
			} catch ( error )
			{
				logger.error( {
					message: `An error occurred while trying to get the PDF doc.${error.message}`, metadata: error.stack,
					codeFile: 'pdf.js',
				} );
				if (!res.headersSent) res.status(500).send('An error occurred while trying to get the PDF doc.');
			}

			res.send( pdfAsBase64 );

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
	}
});

module.exports = router;
