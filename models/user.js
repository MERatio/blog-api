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

// Virtuals
UserSchema.virtual('forPublic').get(function () {
	return {
		_id: this.id,
		username: this.username,
		admin: this.admin,
	};
});

module.exports = mongoose.model('User', UserSchema);
