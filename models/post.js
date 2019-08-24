const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const postSchema = new mongoose.Schema({
	title: {
		type: String,
		required: 'Title is required',
		minlength: 10,
		maxlength: 100
	},
	body: {
		type: String,
		required: 'body is  required',
		minlength: 10,
		maxlength: 1000
	},
	photo: {
		type: Buffer,
		contentType: String
	},
	postedBy: {
		type: ObjectId, // hold the Object id
		ref: 'User', //refert the User model
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	}
});

module.exports = mongoose.model('Post', postSchema);
