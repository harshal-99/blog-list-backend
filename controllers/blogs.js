import {Router} from "express";
import Blog from "../models/blog.js";
import User from "../models/user.js";
import {body, param} from "express-validator";
import middleware from "../utils/middleware.js";
import Comment from "../models/comment.js";

const blogsRouter = Router()


blogsRouter.get('/', async (request, response, next) => {
	const blogs = await Blog.find({})
	response.json(blogs);
})

blogsRouter.post('/',
	body('title').isString().trim().isLength({min: 4}).escape(),
	body('content').isString().trim().escape(),
	body('likes').default(0).isNumeric(),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}
		const {title, content, likes} = request.body
		const decodedToken = middleware.validateToken(request, response, next)

		const user = await User.findById(decodedToken.id)

		const blog = new Blog({
			title,
			author: user.name,
			content,
			likes: likes || 0,
			userId: user._id
		})
		const savedBlog = await blog
			.save()
		user.blogs = user.blogs.concat(savedBlog._id)
		await user.save()
		savedBlog.userId = {id: user._id}
		response.status(201).json(savedBlog)
	})

blogsRouter.get('/:id',
	param('id').isMongoId(),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}
		const decodedToken = middleware.validateToken(request, response, next)
		const user = await User.findById(decodedToken.id)

		const blog = await Blog
			.findById(request.params.id)

		if (user._id.toString() !== blog.userId.toString()) {
			return response.status(401).json({error: 'not authorized'})
		}
		response.json(blog)
	})

blogsRouter.delete('/:id',
	param('id').isMongoId(),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}
		const decodedToken = middleware.validateToken(request, response, next)
		const user = await User.findById(decodedToken.id)

		const blogToDelete = await Blog
			.findById(request.params.id)
		if (!blogToDelete) return response.status(404).json({error: 'Blog not found'})

		if (user._id.toString() !== blogToDelete.userId.toString()) {
			return response.status(401).json({error: 'not authorized'})
		}
		await blogToDelete.remove()
		response.status(200).end()
	})

blogsRouter.put('/:id',
	param('id').isMongoId(),
	body('title').isString().trim().isLength({min: 4}).escape(),
	body('content').isString().trim(),
	body('likes').isNumeric().default(0),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}
		const decodedToken = middleware.validateToken(request, response, next)
		const user = await User.findById(decodedToken.id)

		const {title, content, likes} = request.body

		const blog = await Blog
			.findById(request.params.id)

		if (!blog)
			return response.status(404).json({error: 'Blog not found'})
		blog.title = title
		blog.author = user.name
		blog.content = content
		blog.likes = likes
		await blog.save()
		response.status(201).json(blog)
	})

blogsRouter.get('/:id/comments',
	param('id').isMongoId(),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}

		const blog = await Blog
			.findById(request.params.id)

		if (!blog)
			return response.status(404).json({error: 'Blog not found'})

		const comments = await Blog
			.findById(request.params.id)
			.populate('comments', {userId: 1, blogId: 1, comment: 1, date: 1})

		response.json(comments.comments)
	}
)


blogsRouter.post('/:id/comments',
	param('id').isMongoId(),
	body('comment').isString().trim().escape(),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}

		const blog = await Blog.findById(request.params.id)
		if (!blog) {
			return response.status(404).json({error: 'Blog not found'})
		}
		const decodedToken = middleware.validateToken(request, response, next)

		const user = await User.findById(decodedToken.id)
		if (!user) {
			return response.status(404).json({error: 'User not found'})
		}

		const {comment} = request.body
		const newComment = new Comment({
			comment,
			userId: user._id,
			blogId: blog._id,
			date: new Date().getTime()
		})
		const savedComment = await newComment.save()
		blog.comments = blog.comments.concat(savedComment._id)
		await blog.save()
		response.status(201).json(savedComment)
	}
)

export default blogsRouter
