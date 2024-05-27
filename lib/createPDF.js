const { PDFDocument } = require('pdf-lib');
const puppeteer = require('puppeteer');
const reportTemplate = require('./reportTemplate.js');
const logger = require('./logger.js');

async function createPDFBase( data )
{
  console.log('createPDFBase', data);

  let browser;
  try
  {
    // Create the PDF
    if ( data )
    {

      const { headTemplate, pageArray, footerTemplate } = createPDFhtmlString( data );


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
          right: 0,
        },
      };

      //const browser = await puppeteer.launch();
      browser = await puppeteer.launch( {
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
          '--use-mock-keychain',
        ],
        ignoreDefaultArgs: [ '--disable-extensions' ],
      } );


      const pdfs = [];

      try {
      for ( let i = 0; i < pageArray.length; i++ )
      {
        const page = await browser.newPage();
        await page.goto( 'data:text/html,' + encodeURIComponent( pageArray[ i ] ), { waitUntil: 'networkidle0' } );
        const pdf = await page.pdf( options );
        pdfs.push( pdf );
        await page.close();
      }
      } catch ( err )
      {
        logger.error( {
          message: `Error creating PDF, ${err.message}`,
          metadata: {stack: err.stack},
        } );
        throw err;
      }

      // Now you have an array of PDFs, one for each page
      logger.info({
        message: 'PDF pages created',
        codefile: 'createPDF.js',
      });
      // Create a new PDFDocument
      const pdfDoc = await PDFDocument.create();

      try {
      for ( const pdfBytes of pdfs )
      {
        // Load the PDF into a PDFDocument
        const donorPdfDoc = await PDFDocument.load( pdfBytes );

        // Copy all pages from the donor PDF into the new PDF
        const donorPageIndices = Array.from( donorPdfDoc.getPageIndices() );
        const copiedPages = await pdfDoc.copyPages( donorPdfDoc, donorPageIndices );
        copiedPages.forEach( ( page ) => pdfDoc.addPage( page ) );
      }
      } catch ( err )
      {
        logger.error( {
          message: 'Error adding pages to PDF',
          metadata: err,
        } );
        throw err;
      }
      try
      {
        // Serialize the PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();

        logger.info({
          message: 'PDF created',
          codefile: 'createPDF.js',
        })

        // Return the PDF bytes
        return pdfBytes;
      } catch ( err )
      {
        logger.error( {
          message: 'Error saving PDF',
          metadata: err,
        } );
        throw new Error( 'Error saving PDF' );
      }

    } else
    {
      logger.error( {
        message: 'No data provided',
      } );
      throw new Error( 'No data provided' );
    }
  } catch ( error )
  {
    console.log( error );
    logger.error( {
      message: 'An error occurred while generating the PDF.',
      metadata: { error },
      codeFile: 'createPDF.js',
    }
    );
    throw error;
  } finally
  {
    if ( browser )
    {
      await browser.close();
    }
  }
}

function createPDFhtmlString(data) {
	try {
		if (!data) return null;

    const colors = {
      ftg: {
        title: '#53c2fc',
        date: '#a3ddfc',
        oddRow: '#d8f0fc',
      },
      lon: {
        title: '#f89e01',
        date: '#ffca6d',
        oddRow: '#ffe8bf',
      },
      sem: {
        title: '#65d94e',
        date: '#91ff7b',
        oddRow: '#cfffc6',
      }
    }



		const { company = {}, entry = {}, fileInfo = {} } = data;
		const { name, orgNr, store = '' } = company;
		const { fileId, fileType } = fileInfo;
		const { date: entryDate, amount, account, dim, description = [] } = entry;

		const docType = fileType;
		const date = entryDate;
		const companyName = name;
		const storeNumber = store;

    const titleColor = colors[docType].title;
    const dateColor = colors[docType].date;
    const oddRowColor = colors[docType].oddRow;

		const headTemplate = reportTemplate.headTemplate({ docType, date, orgNr, companyName, storeNumber, titleColor, dateColor });
		let chunkSize = 0;
		const footerTemplate = reportTemplate.footerTemplate({ fileId });
		let heightPx = 10;
		if (account.length <= 24) {
			chunkSize = account.length;
			if (chunkSize <= 15) heightPx = 13;
		} else {
			chunkSize = 23;
			heightPx = 12;
		}
		const pageArray = [];

		let numChunks = Math.ceil(account.length / chunkSize);

		for (let j = 0; j < numChunks; j++) {
			const bodyArray = [];

			const header = reportTemplate.header({ heightPx, oddRowColor });
			bodyArray.push(header);

			for (let i = j * chunkSize; i < (j + 1) * chunkSize && i < account.length; i++) {
				const oddOrNot = i % 2 === 0;
				const debet = amount[i] > 0 ? amount[i] : '';
				const kredit = amount[i] < 0 ? -amount[i] : '';
				const accountItem = account[i];
				const costCentreItem = dim[i];
				const descriptionItem = !description[i] ? '' : description[i];
				const line = reportTemplate.dataRows({
					oddOrNot,
					account: accountItem,
					costCentre: costCentreItem,
					description: descriptionItem,
					debet,
					kredit,
				});
				bodyArray.push(line);
			}
			if (j === numChunks - 1) {
				const sumDebet = amount.filter(a => a > 0).reduce((a, b) => a + b, 0);
				const sumKredit = amount.filter(a => a < 0).reduce((a, b) => a + b, 0);
				const sumDK = reportTemplate.sumRow({ sumDebet, sumKredit });
				bodyArray.push(sumDK);
			} else {
				bodyArray.push(reportTemplate.ending());
      }
      const reportBody = bodyArray.join('\n');
			pageArray.push(reportBody);
		}



		return {
			headTemplate,
			pageArray,
			footerTemplate,
		};
	} catch (error) {
		logger.error({
			message: 'Error in createPDFhtmlString',
			metadata: { error },
		});
		throw error;
	}
}

module.exports = createPDFBase;
