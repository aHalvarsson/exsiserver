const nodemailer = require('nodemailer');

// async..await is not allowed in global scope, must use a wrapper
async function mailer(logEntry) {
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
         text: `${logEntry.timestamp} - ${logEntry.level}\n
		${logEntry.message ? 'Log message: ' + logEntry.message + '\n' : ''}
		${logEntry.errorMsg ? 'Error message: ' + logEntry.errorMsg + '\n' : ''}
		${logEntry.errorStack ? 'Error stack: ' + logEntry.errorStack + '\n' : ''}
		${logEntry.company ? 'Company: ' + logEntry.company + '\n' : ''}
		${logEntry.store ? 'Store: ' + logEntry.store + '\n' : ''}
		${logEntry.metadata ? 'Metadata: ' + logEntry.metadata + '\n' : ''}
		${logEntry.label ? 'Label: ' + logEntry.label + '\n' : ''}
		${logEntry.codefile ? 'Codefile: ' + logEntry.codefile + '\n' : ''}
		${logEntry.codeEnv ? 'CodeEnv: ' + logEntry.codeEnv + '\n' : ''}
		`, // plain text body
         html: JSON.stringify(logEntry), // html body
      });

      if (info.accepted.length > 0) {
         return true;
      } else if (info.rejected.length > 0) {
         return false;
      } else {
         return false;
      }
   } catch (err) {
      console.error(err);
      return false;
   }
}

module.exports = mailer;
