const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const { ObjectId } = mongoose.Schema;
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true
	},
	hashed_password: {
		type: String,
		required: true
	},
	salt: String,
	created: {
		type: Date,
		default: Date.now
	},
	updated: Date,
	photo: {
		data: Buffer,
		contentType: String
	},
	about: {
		type: String,
		trim: true
	},
	following: [ { type: ObjectId, ref: 'User' } ],
	followers: [ { type: ObjectId, ref: 'User' } ]
});
/* Virtulal fields are not going to persisted in database

*/
//virtual field
userSchema
	.virtual('password')
	.set(function(password) {
		//create temporary variable and store password in it.
		this._password = password;
		//generate a timestamp
		this.salt = uuidv1(); // // ⇨ '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e' return like this
		this.hashed_password = this.encryptPassword(password);
	})
	.get(function() {
		this._password;
	});

//methods

userSchema.methods = {
	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	},

	encryptPassword: function(password) {
		if (!password) {
			return '';
		}
		try {
			return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
		} catch (err) {
			return '';
		}
	}
};

module.exports = mongoose.model('User', userSchema);
