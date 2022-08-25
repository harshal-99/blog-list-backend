import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {Router} from "express";
import User from "../models/user.js";
import Config from "../utils/config.js";
import {body} from "express-validator";
import middleware from "../utils/middleware.js";

const loginRouter = Router()

loginRouter.post('/',
	body('username').isString().trim().isLength({min: 4}).escape(),
	body('password').isString().trim().isLength({min: 4}).escape(),
	async (request, response, next) => {
		middleware.validateErrors(request, response, next)
		if (response.headersSent) {
			return
		}
		const {username, password} = request.body

		const user = await User.findOne({username})

		const passwordCorrect = user === null
			? false
			: await bcrypt.compare(password, user.passwordHash)

		if (!(user && passwordCorrect)) {
			return response.status(401).json({error: 'invalid username or password'})
		}

		const userForToken = {
			username: user.username,
			id: user._id,
		}

		const token = jwt.sign(userForToken, Config.JWT_SECRET, {expiresIn: 60 * 60 * 24})

		response
			.status(200)
			.send({token, username: user.username, name: user.name, id: user._id})
	})

export default loginRouter
