import Blog from "../models/blog.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const initialBlogs = [
	{
		title: "A New Title",
		author: "me...",
		"content": "",
		likes: 40
	},
	{
		title: "Old Title",
		author: "you...",
		"content": "",
		likes: 4
	},
]

export const initialUsers = [
	{
		username: "roots",
		name: "roots",
		password: "password"
	}
]

export const savedUser = async () => {
	const passwordHash = await bcrypt.hash(initialUsers[0].password, 10)
	const newUser = {
		username: initialUsers[0].username,
		name: initialUsers[0].name,
		passwordHash
	}
	const savedUser = await User.create(newUser)
	return savedUser.toJSON()
}

export const usersInDb = async () => {
	const users = await User.find({})
	return users.map(u => u.toJSON())
}

export const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(blog => blog.toJSON())
}
