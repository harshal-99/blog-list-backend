import {Router} from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import {body} from "express-validator";
import middleware from "../utils/middleware.js";

const usersRouter = Router()

usersRouter.post('/',
	body('username').isString().trim().isLength({min: 4}).escape(),
	body('name').isString().trim().isLength({min: 4}).escape(),
	body('password').isString().trim().isLength({min: 4}).escape(),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}
		const {username, name, password} = request.body

		const existingUser = await User.findOne({username})
		if (existingUser) {
			return response.status(400).json({error: 'username must be unique'})
		}

		const saltRounds = 10
		const passwordHash = await bcrypt.hash(password, saltRounds)
		const user = new User({
			username,
			name,
			passwordHash
		})
		const savedUser = await user.save()
		response.status(201).json({id: savedUser._id})
	})

export default usersRouter;
