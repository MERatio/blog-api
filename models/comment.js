const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
	{
		author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
		body: { type: String, required: true, maxlength: 200 },
	},
	{
		// Add createdAt and updatedAt fields
		timestamps: true,
	}
);

module.exports = mongoose.model('Comment', CommentSchema);
