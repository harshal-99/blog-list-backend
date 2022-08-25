import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	blogId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Blog",
		required: true
	},
	comment: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		defaultValue: new Date().getTime()
	}
})

commentSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
