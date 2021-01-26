const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
	{
		author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		title: { type: String, required: true, maxlength: 60 },
		body: { type: String, required: true, maxlength: 1000 },
		published: { type: Boolean, required: true, default: false },
	},
	{
		// Add createdAt and updatedAt fields
		timestamps: true,
	}
);

module.exports = mongoose.model('Post', PostSchema);
