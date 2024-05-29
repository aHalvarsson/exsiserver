// Import required modules
const { logger, helper, queueManager } = require('../lib/modules.js');
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
      const task = helper.createTask('pdfGen', data);

      // Add task to the queue
      queueManager.addTask(task);

      if (queueManager.queue.length > 5) {
        // Process the queue
        queueManager.processAll();
      }
      // Send response
      res.status(200).send('PDF generation started');
    } else {
      // Log and send error response if no data provided
      logger.error({
        message: 'No data provided',
        codeFile: 'pdf.js',
      });
      if (!res.headersSent) res.status(500).send('No data provided');
    }

    // Send any pending logs
    // await logger.sendLogArray();
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
