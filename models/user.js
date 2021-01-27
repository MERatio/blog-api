const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: {
		type: String,
		required: true,
		maxlength: 20,
		index: true,
		unique: true,
	},
	password: { type: String, required: true },
});

// Virtuals
UserSchema.virtual('forPublic').get(function () {
	return {
		_id: this.id,
		username: this.username,
	};
});

module.exports = mongoose.model('User', UserSchema);
