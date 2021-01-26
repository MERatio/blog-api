const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
	{
		post: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
		username: {
			type: String,
			required: true,
			maxlength: 20,
			unique: true,
		},
		body: { type: String, required: true, maxlength: 200 },
	},
	{
		// Add createdAt and updatedAt fields
		timestamps: true,
	}
);

module.exports = mongoose.model('Comment', CommentSchema);
