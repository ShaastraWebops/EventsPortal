/* This 
  is used
  for sending mails
*/
var nodemailer = require('nodemailer');


'use strict';
module.exports = function sendEmail(sub, text, emailTo, messageId, initial) {
 var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'amkvijay@gmail.com',
          pass: 'srimuruga'
        }
      });
      if(!(initial)){
      	var mailOptions = {
        to: emailTo,
        from: 'amkvijay@gmail.com',
        subject: sub,
        text: text,
        messageId: messageId+'-erp-saarang@saarang.org',
      };
      }
      if(initial){
      	var mailOptions = {
        to: emailTo,
        from: 'amkvijay@gmail.com',
        subject: sub,
        text: text,
        messageId: messageId+'-erp-saarang@saarang.org',
        inReplyTo: messageId+'-erp-saarang@saarang.org'
      };
      }
      smtpTransport.sendMail(mailOptions, function (err, info) {
        
      });   
};
