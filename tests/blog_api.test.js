import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import Blog from "../models/blog.js";
import {blogsInDb, initialBlogs, initialUsers, savedUser} from "./test_helper.js";

const api = supertest(app)

let token

beforeEach(async () => {
	await Blog.deleteMany({})
	const user = await savedUser()
	const blogObjects = initialBlogs.map(blog => new Blog({...blog, userId: user.id}))
	const promiseArray = blogObjects.map(blog => blog.save())
	await Promise.all(promiseArray)
	const {body} = await api
		.post('/api/login')
		.send({username: initialUsers[0].username, password: initialUsers[0].password})

	token = body.token
})


describe('when there is initially some blogs', function () {
	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})
	test('all blogs are returned', async () => {
		const response = await api
			.get('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.expect(200)
		expect(response.body.length).toBe(initialBlogs.length)
	})
	test('a specific blog is within the returned blogs', async () => {
		const response = await api
			.get('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.expect(200)

		const titles = response.body.map(r => r.title)

		expect(titles).toContain('A New Title')
	})
})


describe('viewing a specific blog', function () {
	test('succeeds with a valid id', async () => {
		const blogsAtStart = await blogsInDb()

		const blogToView = blogsAtStart[0]

		const resultBlog = await api
			.get(`/api/blogs/${blogToView.id}`)
			.set('Authorization', `bearer ${token}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		expect(resultBlog.body).toEqual(blogToView)
	})
	test('fails with statuscode 400 if id is invalid', async () => {
		const invalidId = '5a3d5da59070081a82a3445'

		await api
			.get(`/api/blogs/${invalidId}`)
			.set('Authorization', `bearer ${token}`)
			.expect(400)
	})
})


describe('addition of a new blog', function () {
	test('succeeds with valid data', async () => {
		const newBlog = {
			title: "A New Title",
			author: "lalalal",
			content: "www.google.com",
		}

		await api
			.post('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await blogsInDb()
		expect(blogsAtEnd.length).toBe(initialBlogs.length + 1)

		const titles = blogsAtEnd.map(r => r.title)
		expect(titles).toContain('A New Title')
	})

	test('fails with statuscode 400 if data is invalid', async () => {
		const newBlog = {
			author: "lalalal",
			content: "www.google.com",
		}

		await api
			.post('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(400)

		const blogsAtEnd = await blogsInDb()
		expect(blogsAtEnd.length).toBe(initialBlogs.length)
	})
})


describe('delete of a blog', function () {
	test('succeeds with statuscode 204 if id is valid', async () => {
		const blogsAtStart = await blogsInDb()
		const blogToDelete = blogsAtStart[0]

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set('Authorization', `bearer ${token}`)
			.expect(204)

		const blogsAtEnd = await blogsInDb()

		expect(blogsAtEnd.length)
			.toBe(blogsAtStart.length - 1)

		const titles = blogsAtEnd.map(r => r.title)

		expect(titles).not.toContain(blogToDelete.title)
	})
})

describe('update of a blog', function () {
	test('succeeds with statuscode 204 if id is valid', async () => {
		const blogsAtStart = await blogsInDb()
		const blogToUpdate = blogsAtStart[0]
		blogToUpdate.title = "No title"
		await api
			.put(`/api/blogs/${blogToUpdate.id}`)
			.set('Authorization', `bearer ${token}`)
			.send(blogToUpdate)
			.expect(204)

		const blogsInDbAfterUpdate = await blogsInDb()

		const titles = blogsInDbAfterUpdate.map(r => r.title)
		expect(titles).toContain("No title")
	})
})


afterAll(async () => {
	await mongoose.connection.close()
})
