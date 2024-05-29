const logger = require('./logger');
const createPDFBase = require('./createPDF');
const helper = require('./helper');
const fs = require('fs');
const path = require('path');

const generateStart = async (data) => {
   const pdfFilename = `${data.fileInfo.fileId.split('.').slice(0, -1).join('')}_${helper.convertDate(data.entry.date)}.pdf`;

   // Create the PDF
   if (data) {
      try {
         // Generate PDF content
         const pdfAsBytes = await createPDFBase(data);
         // Create directory if it doesn't exist and write PDF file
         const dir = path.join(__dirname, 'tmp');
         if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
         }
         fs.writeFileSync(path.join(dir, pdfFilename), pdfAsBytes);
      } catch (error) {
         // Log error if PDF creation fails and send error response
         logger.error({
            message: `An error occurred while trying to get the PDF doc.${error.message}`,
            metadata: error.stack,
            codeFile: 'pdf.js',
         });

         throw error;
      }

      // Send PDF download link
      return {
         itemId: data.itemId,
         pdfUrl: `${process.env.BASE_URL}/pdfs/${pdfFilename}`,
      };
   } else {
      // Log and send error response if no data provided
      logger.error({
         message: 'No data provided',
      });

      return;
   }
};

module.exports = generateStart;
