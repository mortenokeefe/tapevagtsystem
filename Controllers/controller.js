
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tapetestmail@gmail.com',
            pass: 'qawerty22'
        }
    }
);

let mailOptions = {
    from: 'tapetestmail@gmail.com',
    to: 'tomail her',
    subject: 'Vagtsalg',
    text: 'Din vagt er blevet solgt'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error)
    } else {
        console.log('Email sent: '+ info.response);
    }
})



