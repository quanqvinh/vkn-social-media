const nodemailer = require('nodemailer');
const engine = require('express-handlebars');
const hbs = engine.create({ extname: '.hbs' });

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.OUR_EMAIL,
		pass: process.env.EMAIL_PASSWORD
	}
});

async function verify({to, user_id, token}) {
	let mailOptions = {
		from: process.env.OUR_EMAIL,
		to,
		subject: 'VKN verification email',
		html: await hbs.render('./src/templates/verify.mail.hbs', { 
			user_id, 
			token 
		})
	};
	transporter.sendMail(mailOptions, (err, info) => {
		if (err)
			console.log(err);
		else 
			console.log('Email send:', info.response);
	})
};

async function resetPassword({ to, user_id, token }) {
	let mailOptions = {
		from: process.env.OUR_EMAIL,
		to,
		subject: 'VKN reset password email',
		html: await hbs.render('./src/templates/resetPassword.mail.hbs', { 
			user_id, 
			token 
		})
	};
	transporter.sendMail(mailOptions, (err, info) => {
		if (err)
			console.log(err);
		else 
			console.log('Email send:', info.response);
	})
}

module.exports = { verify, resetPassword };