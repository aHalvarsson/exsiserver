const createPDFhtmlString = require('../lib/createPDF.js');
const puppeteer = require('puppeteer');
const logger = require('../lib/logger.js');
var express = require('express');
var router = express.Router();

router.post('/', async function (req, res, next) {
	try {
		console.log('POST /pdf');
		const data = req.body;
		let pdf;

		const clientInfo = {
			ip: req.ip,
			userAgent: req.headers['user-agent'],
		};
		const isMe = req.headers['is-it-me'] === 'true';

		// Create the PDF
		if (data) {
			const { headTemplate, reportBody, footerTemplate } = createPDFhtmlString(data);

			try {
				const options = {
					format: 'A4',
					displayHeaderFooter: true,
					headerTemplate: headTemplate,
					footerTemplate: footerTemplate,
				};

				//const browser = await puppeteer.launch();
				const browser = await puppeteer.launch({
					args: ['--no-sandbox'],
					ignoreDefaultArgs: ['--disable-extensions'],
				});

				const page = await browser.newPage();

				await page.setContent(reportBody);

				pdf = await page.pdf(options);

				await browser.close();
			} catch (error) {
				logger.error({ message: `Top try: ${error.message}`, metadata: error.stack });
				console.log(error.message);

				//res.status( 500 ).send( 'Top error: An error occurred while generating the PDF.' );
			}
			// Convert the PDF to a base64 string
			const base64String = pdf.toString('base64');
			logger.info({ message: 'PDF converted to base64 string' });

			// Send the base64 string as a JSON object
			res.send(base64String);
		} else {
			logger.error({
				message: 'No data provided',
				metadata: { clientInfo },
			});

			res.send('No data provided');
		}
	} catch (error) {
		if (!res.headersSent) {
			console.log(error);
			logger.error({ message: 'Bottom try: An error occurred while generating the PDF.', metadata: { error } });
			res.status(500).send('Bottom error: An error occurred while generating the PDF.');
		}
	}
});

module.exports = router;
