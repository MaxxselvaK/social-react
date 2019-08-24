const User = require('../models/user');
const JWT = require('jsonwebtoken');
var expressJWT = require('express-jwt');

require('dotenv').config();
exports.signup = async (req, res) => {
	const userExist = await User.findOne({ email: req.body.email });
	if (userExist) {
		return res.status(403).json({
			error: 'Email is taken'
		});
	}
	const user = await new User(req.body);
	await user.save();
	res.status(200).json({ user });
};

exports.signin = (req, res) => {
	const { email, password } = req.body;

	//find the user
	User.findOne({ email }, (err, user) => {
		console.log('user');
		if (err || !user) {
			console.log('user1');
			return res.status(400).json({
				error: 'User with that email not Exist! please sign up'
			});
		}
		//if user found then match the password

		if (!user.authenticate(password)) {
			console.log('user3');
			return res.status(400).json({
				error: 'Email and password does not match'
			});
		}

		const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET);
		res.cookie('maxx', token, { expire: new Date() + 10000 });

		return res.status(200).json({
			token,
			user
		});
	});

	//if error or no user

	//if user, authenticate

	//generate the jwt token

	//persist the token named maxx

	//return response with user and token to frontendclient
};

exports.signout = (req, res) => {
	res.clearCookie('maxx');
	return res.status(200).json({
		message: 'signout success'
	});
};

//validate each and every request , apply middleware to every request

exports.requireSignin = expressJWT({
	//if token is valid then it will append verified user id to the request parameter
	secret: process.env.JWT_SECRET,
	userProperty: 'auth'
});
