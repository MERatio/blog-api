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

CommentSchema.pre('remove', async function () {
	// Remove the comment._id from author.comments
	const author = await this.model('User').findById(
		this.author._id || this.author
	);
	author.comments.pull({ _id: this._id });
	await author.save();

	// Remove the comment._id from post.comments
	const post = await this.model('Post').findById(this.post._id || this.post);
	/* Checked for post because, when post is deleted it runs its pre remove middleware, 
		 that post's comments will be deleted and runs this middleware
		 Therefore, post will be null.
	*/
	if (post) {
		post.comments.pull({ _id: this._id });
		await post.save();
	}
});

module.exports = mongoose.model('Comment', CommentSchema);
