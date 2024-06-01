const nodemailer = require('nodemailer');
const logger = require('./logger');

// async..await is not allowed in global scope, must use a wrapper
export async function mailer(logEntry) {
   try {
      const transporter = nodemailer.createTransport({
         host: 'smtp.zoho.eu',
         port: 587,
         secure: false,
         auth: {
            user: 'exsicon_error@zohomail.eu',
            pass: process.env.ZOHO,
         },
      });
      // send mail with defined transport object
      const info = await transporter.sendMail({
         from: '"Logger - ExSicon automessage" <exsicon_error@zohomail.eu>', // sender address
         to: process.env.AMAIL, // list of receivers
         subject: 'Logger - ExSicon Heroku server automessage', // Subject line
         text: JSON.stringify(logEntry), // plain text body
         html: JSON.stringify(logEntry), // html body
      });

      logger.info({
         message: 'Mail sent',
         metadata: info,
         codeFile: 'mailer.js',
      });

      if (info.accepted.length > 0) {
         return true;
      } else if (info.rejected.length > 0) {
         return false;
      } else {
         return false;
      }
   } catch (err) {
      logger.error({
         message: `mailer error: ${err.message}`,
         metadata: `stack: ${{ stack: err.stack }}, missed entry: ${JSON.stringify(logEntry)}`,
         codeFile: 'mailer.js',
      });
   }
}
