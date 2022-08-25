import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	content: {
		type: String
	},
	likes: {
		type: Number,
		defaultValue: 0
	},
	date: {
		type: Date,
		defaultValue: new Date().getTime()
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment",
		}
	]
})

blogSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

const Blog = mongoose.model('Blog', blogSchema)

export default Blog
