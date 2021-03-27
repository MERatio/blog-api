const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	firstName: { type: String, required: true, maxlength: 255 },
	lastName: { type: String, required: true, maxlength: 255 },
	username: {
		type: String,
		required: true,
		maxlength: 20,
		index: true,
		unique: true,
	},
	password: { type: String, required: true },
	admin: { type: Boolean, required: true, default: false },
});

UserSchema.set('toJSON', {
	transform(doc, ret, options) {
		const { password, ...retJson } = ret;
		return retJson;
	},
});

module.exports = mongoose.model('User', UserSchema);
