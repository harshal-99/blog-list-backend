import {initialUsers, savedUser} from "./test_helper.js";
import User from "../models/user.js";
import supertest from "supertest";
import app from "../app.js";
import mongoose from "mongoose";

const api = supertest(app)

describe('login', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		const user = await savedUser()
	})
	test('is successful when user exists', async () => {
		const response = await api
			.post('/api/login')
			.send({
				username: initialUsers[0].username,
				password: initialUsers[0].password
			})
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})
	test("fails when user dose not exist", async () => {
		const user = {
			username: "notexisting",
			password: "notexisting"
		}

		await api
			.post("/api/login")
			.send(user)
			.expect(401)
			.expect("Content-Type", /application\/json/)

	})
});

afterAll(async () => {
	await mongoose.connection.close()
})
