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
		let browser;

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
					printBackground: true,
					margin: {
						top: 0,
						bottom: 0,
						left: 0,
						right: 0
					}
				};

				//const browser = await puppeteer.launch();
				browser = await puppeteer.launch({
					args: [
						'--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
            '--autoplay-policy=user-gesture-required',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-dev-shm-usage',
            '--disable-domain-reliability',
            '--disable-extensions',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-print-preview',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-setuid-sandbox',
            '--disable-speech-api',
            '--disable-sync',
            '--hide-scrollbars',
            '--ignore-gpu-blacklist',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-sandbox',
            '--no-zygote',
            '--password-store=basic',
            '--use-gl=swiftshader',
						'--use-mock-keychain'
					],
					ignoreDefaultArgs: ['--disable-extensions'],
				});

				const page = await browser.newPage();

				//await page.setContent( reportBody );
				await page.goto('data:text/html,' + encodeURIComponent(reportBody), { waitUntil: 'networkidle0' });


				pdf = await page.pdf(options);

				
			} catch (error) {
				logger.error({ message: `Top try: ${error.message}`, metadata: error.stack });
				console.log(error.message);


			} finally {
  if (browser) {
    await browser.close();
  }
}
			// Convert the PDF to a base64 string
			const base64String = pdf.toString('base64');

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
			logger.error({ message: 'An error occurred while generating the PDF.', metadata: { error } });
			res.status(500).send('An error occurred while generating the PDF.');
		}
	}
});

module.exports = router;
