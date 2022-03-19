const User = require('../models/user.model');
const crypto = require('../utils/crypto');
const jwt = require('jsonwebtoken');
const mail = require('../utils/nodemailer');
const fs = require('fs');
const secretKey = process.env.SECRET_KEY;

module.exports = {
	// [POST] /api/signup
	async signup(req, res, next) {
		const params = req.body;
		// Check username exists 
		let user = await User.findOne({
			username: params.username
		});
		if (user)
			return res.status(400).json({
				status: 'error',
				message: 'Username already exists!'
			});

		// Check email is used ?
		user = await User.findOne({
			email: params.email
		});
		if (user)
			return res.status(400).json({
				status: 'error',
				message: 'User with given email already exist!'
			});

		// Save account to database
		let token = jwt.sign({
			username: params.username,
			ext: Math.floor(Date.now() / 1000) + 3600,
			sub: 'verify_account'
		}, secretKey);

		user = await new User({
			username: params.username,
			email: params.email,
			auth: {
				password: crypto.hash(params.password)
			},
			name: params.name
		}).save();

		// Send mail
		mail.sendMail({
			to: params.email,
			subject: 'VKN verification email',
			text: `Hi ${params.name}`,
			// html: await fs.readFileSync('../templates/verify.mail.html')
			// html: `<a href='http://localhost:3000/auth/verify-email/${user._doc._id}/${token}'>Click here to verify</a>`
			html: `<a href='http://localhost:7070/api/verify/${user._doc._id}/${token}'>Click here to verify</a>`
		});
		res.status(201).json({
			status: 'success',
			message: 'Account is created'
		});
	},

	// [GET] /api/login
	async login(req, res, next) {
		// Find user with id or email
		const { username, password } = req.query;
		console.log(username, password);
		let user = username.includes('@') ? 
			await User.findOne({
				email: username
			}) : 
			await User.findOne({
				username
			});
			
		if (!user || user.auth.isAdmin)
			return res.status(404).json({
				status: 'error',
				message: 'Username or email is not found'
			});

		// Check password
		if (!crypto.match(user.auth.password, password))
			return res.status(401).json({
				status: 'error',
				message: 'Password is wrong'
			});
		
		let token = jwt.sign({
			username,
			isAdmin: user.auth.isAdmin,
			sub: 'access_token'
		}, secretKey);
		
		res.json({
			status: 'success',
			message: 'Login successful',
			accessToken: token,
			userData: user
		})
	},

	// [GET] /api/verify/:id/:token
	async verifyEmail(req, res, next) {
		// Find user with id
		let user = await User.findOne({
			_id: req.params.id
		});
		if (!user)
			return res.status(404).json({
				status: 'error',
				message: 'Username is not found'
			});

		// Check token is valid 
		if (user.auth.verified)
			return res.status(400).json({
				status: 'error',
				message: 'Invalid link'
			});
		let errorMessage;
		jwt.verify(req.params.token, secretKey, (err, decoded) => {
			if (err) {
				if (err.name === 'TokenExpiredError')
					errorMessage = 'Expired link';
				else
					errorMessage = 'Invalid link';
			}
			else {
				if (decoded.username !== user.username || decoded.sub !== 'verify_account')
					errorMessage = 'Invalid link';
			}
		})
		if (errorMessage)
			return res.status(400).json({
				status: 'error',
				message: errorMessage
			});

		user.auth.verified = true;
		await user.save();
		res.status(200).json({
			status: 'success',
			status: 'Email is verified!'
		});
	}
};