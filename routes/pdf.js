// Import required modules
const logger = require('../lib/logger');
const helper = require('../lib/helper');
const queueManager = require('../lib/queueManager/queueManager');
const workers = require('../lib/queueManager/queueWorkers');
var express = require('express');
var router = express.Router();

// Handle POST request for creating PDF
router.post('/', async function (req, res, next) {
   try {
      // Log the request information
      logger.info({
         message: 'POST /pdf called',
         metadata: req.body.fileInfo.fileId,
         codeFile: 'pdf.js',
      });
      const data = req.body;

      if (data) {
         const task = helper.createTask(data, 'pdfGen', workers);

         // Add task to the queue
         queueManager.addTask(task);

         if (queueManager.triggered === false) {
            // Process the queue
            queueManager.processAll();
         }
         // Send response
         res.status(200).send('Task added');
      } else {
         // Log and send error response if no data provided
         logger.error({
            message: 'No data provided',
            codeFile: 'pdf.js',
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

module.exports = router;
