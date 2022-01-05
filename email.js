const nodemailer = require('nodemailer');

const emailService = 'gmail';
const fromEmail = 'g8gonature@gmail.com';
const appPassword = 'omlmimfqczkdglrx';

function sendEmail(toEmail, subject, message) {
    const transporter = nodemailer.createTransport({
        service: emailService,
        auth:{
            user: fromEmail,
            pass: appPassword
        }
    });

    let mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: subject,
        text: message
    }

    transporter.sendMail(mailOptions, function(err, res){
        if (err) {
            return false;
        }
        else {
            return true;
        }
    });
    transporter.close();
}

module.exports.sendEmail = sendEmail;
