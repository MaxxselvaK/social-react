const User = require('../models/user');
const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');
//id is userid
exports.userById = (req, res, next, id) => {
	console.log('id=', id);
	User.findById(id)
		// populate followers and following users array
		.populate('following', '_id name')
		.populate('followers', '_id name')
		.exec((err, user) => {
			if (err || !user) {
				return res.status(400).json({
					error: 'User not found'
				});
			}
			req.profile = user; // adds profile object in req with user info
			next();
		});
};

exports.hasAuthorization = (req, res, next) => {
	const authorized = req.profile && req.auth && req.profile._id === req.auth._id;
	if (!authorized) {
		return res.status(403).json({
			error: 'User is not authorized to perform the operation'
		});
	}
	next();
};
exports.allUsers = (req, res) => {
	User.find((err, users) => {
		if (err) {
			return res.status(400).json({
				error: 'Users not found'
			});
		}
		console.log('all users');
		res.json(users);
	}).select('email name created updated');
};

exports.getUser = (req, res) => {
	if (req.profile) {
		req.profile.hashed_password = undefined;
		req.profile.salt = undefined;
		//console.log('inside');
		res.status(200).json({ user: req.profile });
	} else {
		res.status(400).json({ error: 'not authenticated' });
	}
};

// exports.updateUser = (req, res, next) => {
// 	let user = req.profile;
// 	console.log('userLove', user);
// 	user = _.extend(user, req.body);
// 	console.log(req.body);
// 	user.save((err, user) => {
// 		if (err) {
// 			res.status(400).json({
// 				error: 'You are not authorized to perform this operation'
// 			});
// 		}
// 		user.salt = undefined;
// 		user.hashed_password = undefined;
// 		res.status(200).json({ user });
// 	});
// };
exports.updateUser = (req, res, next) => {
	let form = formidable.IncomingForm();
	console.log('inside updateUser');
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: 'photo could not be uploaded'
			});
		}
		let user = req.profile;
		user = _.extend(user, fields);
		user.updated = Date.now();
		if (files.photo) {
			user.photo.data = fs.readFileSync(files.photo.path);
			user.photo.contentType = files.photo.type;
		}

		user.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			}
			user.hashed_password = undefined;
			user.salt = undefined;
			console.log('updated user', user);
			return res.status(200).json({ user });
		});
	});
};
exports.deleteUser = (req, res, next) => {
	console.log('delete');
	let user = req.profile;
	user.remove((err, user) => {
		if (err) {
			res.status(400).json({
				error: 'you are not authorized to delete the user'
			});
		}
		user.salt = undefined;
		user.hashed_password = undefined;
		res.status(200).json(user);
	});
	//next();
};
exports.userPhoto = (req, res, next) => {
	console.log('inside photo');
	if (req.profile.photo.data) {
		console.log('photo');
		res.set(('Content-Type', req.profile.photo.contentType));
		res.send(req.profile.photo.data);
	}
	next();
};

exports.addFollowing = (req, res, next) => {
	console.log('addFollowing');
	User.findByIdAndUpdate(
		req.body.userId,
		{
			$push: { following: req.body.followId }
		},
		(err, result) => {
			if (err) {
				console.log('addFollower');
				return res.status(400).json({ error: err + 'addFollowing' });
			}
			next();
		}
	);
};
exports.addFollower = (req, res, next) => {
	console.log('addFollower');
	User.findByIdAndUpdate(
		req.body.followId,
		{
			$push: { followers: req.body.userId }
		},
		{ new: true } //to get updated data
	)
		.populate('following', '_id name')
		.populate('followers', '_id name')
		.exec((err, result) => {
			if (err) {
				console.log('addFollower');
				return res.status(400).json({ error: err + 'addFollower' });
			}
			result.hashed_password = undefined;
			result.salt = undefined;
			console.log('res', result);
			return res.json(result);
		});
};
exports.removeFollowing = (req, res, next) => {
	console.log('removeFollowing', req.body.userId);

	User.findByIdAndUpdate(
		req.body.userId,
		{
			$pull: { following: req.body.unfollowId }
		},
		(err, result) => {
			if (err) {
				return res.status(400).json({ error: err });
			}
			next();
		}
	);
};
exports.removeFollower = (req, res, next) => {
	console.log('removeFollower', req.body.unfollowId);
	User.findByIdAndUpdate(
		req.body.unfollowId,
		{
			$pull: { followers: req.body.userId }
		},
		{ new: true } //to get updated data
	)
		.populate('following', '_id name')
		.populate('followers', '_id name')
		.exec((err, result) => {
			if (err) {
				return res.status(400).json({ error: err });
			}
			result.hashed_password = undefined;
			result.salt = undefined;
			return res.json(result);
		});
};

exports.findPeople = (req, res) => {
	let following = req.profile.following;
	following.push(req.profile._id);
	console.log('fol', following);
	User.find({ _id: { $nin: following } }, (err, users) => {
		if (err) {
			return res.status(400).json({ error: err });
		}
		return res.json(users);
	}).select('name');
};
