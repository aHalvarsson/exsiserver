const generateStart = require('../generateStart');
const logger = require('../logger');

const workers = {
   pdfGen: async (data) => {
      try {
         if (!data) {
            return;
         } else {
            return await generateStart(data);
         }
      } catch (err) {
         logger.error({
            message: 'pdfGen worker error',
            metadata: err.stack,
            codeFile: 'queueWorkers.js',
            labels: ['queueWorkers', 'pdfGen'],
         });
         throw err;
      }
   },
};

module.exports = workers;
