const Post = require('../models/post');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
exports.getPosts = (req, res) => {
	const posts = Post.find()
		.populate('postedBy', '_id name')
		.select('_id title body ')
		.then((posts) => {
			res.status(200).json({ posts });
		})
		.catch((err) => console.log(err));
};

exports.createPost = (req, res) => {
	console.log('inside createpost');
	let form = formidable.IncomingForm();
	form.keepExtension = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({ error: 'Image could not be uploded' });
		}
		console.log('field', fields);
		let post = new Post(fields);
		req.profile.hashed_password = undefined;
		req.profile.salt = undefined;
		post.postedBy = req.profile;
		if (files.photo) {
			post.photo.data = fs.readFileSync(files.photo.path);
			post.photo.contentType = files.photo.type;
		}
		post.save((err, result) => {
			if (err) {
				return res.status(400).json({ error: err });
			}
			return res.json(result);
		});
	});
	// const post = new Post(req.body);
	// console.log('creating post', req.body);
	// post.save((err, result) => {
	// 	if (err) {
	// 		return res.status(400).json({
	// 			error: err
	// 		});
	// 	}
	// 	res.status(200).json({
	// 		post: result
	// 	});
	// });
};

exports.postsByUser = (req, res) => {
	Post.find({ postedBy: req.profile._id }).populate('postedBy', '_id name').sort('_created').exec((err, posts) => {
		if (err) {
			return res.status(400).json({ error: err });
		}
		res.status(200).json({ posts });
	});
};

//if postId present in url then populate it to request

exports.postById = (req, res, next, id) => {
	Post.findById(id).populate('postedBy', '_id name').exec((err, post) => {
		if (err || !post) {
			return res.status(400).json({ error: 'post not found' });
		}
		req.post = post;
		next();
	});
};

exports.isPoster = (req, res, next) => {
	console.log('inside isPoster');
	console.log('post', req.post);
	console.log('auth', req.auth);
	console.log('id1', req.post.postedBy._id);
	console.log('id2', req.auth._id);
	let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
	if (!isPoster) {
		return res.status(400).json({ error: 'User is not Authorized to delete the Post' });
	}
	next();
};

//delete the post
exports.updatePost = (req, res, next) => {
	console.log('inside updatePost', req.post);
	let post = req.post;
	post = _.extend(post, req.body);
	post.updated = Date.now();

	post.save((err) => {
		if (err) {
			return res.status(400).json({ error: err });
		}
		res.status(200).json({ post });
	});
};

exports.deletePost = (req, res) => {
	console.log('inside deletePost');
	let post = req.post;
	post.remove((err, post) => {
		if (err) {
			return res.status(400).json({ error: err });
		}
		res.json({ message: 'Post deleted Successfully' });
	});
};
