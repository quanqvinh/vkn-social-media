const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.OUR_EMAIL,
		pass: process.env.EMAIL_PASSWORD
	}
});

function sendMail({to, subject, text, html}) {
	let mailOptions = {
		from: process.env.OUR_EMAIL,
		to,
		subject,
		text, 
		html
	};
	transporter.sendMail(mailOptions, (err, info) => {
		if (err)
			console.log(err);
		else 
			console.log('Email send:', info.response);
	})
};

module.exports = { sendMail };