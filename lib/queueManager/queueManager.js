const logger = require('../logger');
const sender = require('../sendChunks');
const helper = require('../helper');

const BULKSENDSIZE = 5;
class sirWorksALot {
   constructor(concurrency, maxRetries = 3, queueName = 'default') {
      this.concurrency = concurrency;
      this.maxRetries = maxRetries;
      this.queueName = queueName;
      this.queue = []; // The task queue
      this.activeCount = 0; // Concurrency management
      this.retries = new Map(); // Maintains the retry count for each task
      this.bulkSendArray = [];
      this.collection = 'frontBase';
      this.triggered = false;
   }

   addTask(task) {
      this.queue.push(task);
      if (!this.retries.has(task)) {
         this.retries.set(task, 0);
      }
      this.log(`Added task: ${task.id}`); // log task addition
      this.logQueueStatus();
   }

   processNext() {
      try {
         if (this.activeCount >= this.concurrency || this.queue.length === 0) {
            return 'no more tasks to process';
         }
         const task = this.queue.shift();
         this.activeCount++;
         this.triggered = true;

         task().then(
            (data) => this.taskCompleted(task, data),
            (err) => this.taskFailed(task, err)
         );
      } catch (err) {
         console.error(err);
      }
   }

   getActiveCount() {
      return this.activeCount;
   }

   getLastTask() {
      return this.queue[this.queue.length - 1];
   }

   getQueue() {
      return this.queue;
   }

   async processAll() {
      while (this.queue.length > 0 || this.activeCount > 0) {
         if (this.queue.length > 0 && this.activeCount < this.concurrency) {
            this.processNext();
         }

         // Add a delay to allow other code to run
         await helper.takeATimeout(200);
      }

      setTimeout(async () => {
         if (this.queue.length === 0 && this.activeCount === 0) {
            await this.bulkSend();

            this.triggered = false;

            logger.fatal({
               message: `${this.queueName} - No more tasks to process, sending emit done`,
               codeFile: 'queueManager.js',
               labels: ['queueManager', 'processAll'],
            });

            await logger.sendLogArray();
         } else {
            this.processAll();
         }
      }, 10000);
   }

   async taskCompleted(task, data) {
      this.log(`Task completed: ${task.id}`); // log task completion
      this.bulkSendArray.push(data);

      this.logQueueStatus();
      if (this.bulkSendArray.length >= BULKSENDSIZE) {
         const BULKSENDSIZE = Math.min(this.bulkSendArray.length, 100);
         const chunkToSend = this.bulkSendArray.splice(0, BULKSENDSIZE);
         await this.sendChunks(chunkToSend);
      }
      this.activeCount--;
      if (this.queue.length > 0) {
         this.processNext();
      }
   }

   taskFailed(task, err) {
      console.error(`Task failed with error ${err.message}`);

      const retriesSoFar = this.retries.get(task);
      if (retriesSoFar >= this.maxRetries) {
         this.bulkSendArray.push({
            itemId: task.id,
            pdfUrl: null,
            orgNr: task.orgNr,
         });
         logger.error({
            message: `Task abandoned after maximum retries: ${task.id}`,
            errorMsg: err.message,
            errorStack: err.stack,
            codeFile: 'queueManager.js',
            labels: ['queueManager', 'taskFailed'],
         });
      } else {
         this.retries.set(task, retriesSoFar + 1);
         this.queue.push(task);
      }

      this.activeCount--;
      this.logQueueStatus();

      if (this.queue.length > 0) {
         this.processNext();
      }
   }

   async bulkSend() {
      if (this.bulkSendArray.length > 0) {
         try {
            return await this.sendChunks(this.bulkSendArray);
         } catch (err) {
            logger.error({
               message: 'bulkInsert error',
               errorMsg: err.message,
               errorStack: err.stack,
               codeFile: 'queueManager.js',
               labels: ['queueManager', 'bulkInsert'],
            });
         }
      }
   }

   async sendChunks(data) {
      try {
         await sender.sendPdfUrls(data);
      } catch (err) {
         logger.error({
            message: 'sendChunks error',
            errorMsg: err.message,
            errorStack: err.stack,
            codeFile: 'queueManager.js',
            labels: ['queueManager', 'sendChunks'],
         });
      }
   }

   log(message) {
      console.log(`${new Date().toISOString()}: ${message}`); // log with timestamp
   }

   logQueueStatus() {
      this.log(
         `Queue status: ${this.queue.length} tasks in queue, ${this.activeCount} tasks active.`
      );
   }
}

const queueManager = new sirWorksALot(1, 3, 'queueManager');

module.exports = queueManager;
