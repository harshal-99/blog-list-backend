import User from "../models/user.js";
import bcrypt from "bcrypt";
import supertest from "supertest";
import app from "../app.js";
import {initialUsers, usersInDb} from "./test_helper.js";
import mongoose from "mongoose";

const api = supertest(app)

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('password', 10)
		const user = new User({...initialUsers[0], passwordHash})
		await user.save()
	})

	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await User.find({})

		const newUser = {
			username: 'newusername',
			name: 'NewUser',
			password: 'password'
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await User.find({})

		const result = await api
			.post('/api/users')
			.send(initialUsers[0])
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('username must be unique')

		const usersAtEnd = await usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})
});

afterAll(async () => {
	await mongoose.connection.close()
})
