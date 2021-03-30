const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
	{
		author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		title: { type: String, required: true, maxlength: 60 },
		body: { type: String, required: true, maxlength: 1000 },
		published: { type: Boolean, required: true, default: false },
		comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
	},
	{
		// Add createdAt and updatedAt fields
		timestamps: true,
	}
);

PostSchema.pre('remove', async function () {
	// Remove the post._id from author.posts
	const author = await this.model('User').findById(
		this.author._id || this.author
	);
	author.posts.pull({ _id: this._id });
	await author.save();

	// Remove the post's comments
	const comments = await this.model('Comment').find({ post: this._id });
	comments.forEach(async (comment) => {
		await comment.remove();
	});
});

module.exports = mongoose.model('Post', PostSchema);
