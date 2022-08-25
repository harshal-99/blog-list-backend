import logger from "./logger.js";
import jwt from "jsonwebtoken";
import Config from "./config.js";
import {validationResult} from "express-validator";

const errorHandler = (error, request, response, next) => {
	if (error.name === "CastError") {
		return response.status(400).send({error: "malformatted id"})
	} else if (error.name === "ValidationError") {
		return response.status(400).json({error: error.message})
	} else if (error.name === 'JsonWebTokenError') {
		return response.status(401).json({
			error: 'invalid token'
		})
	} else if (error.name === 'TokenExpiredError') {
		return response.status(401).json({
			error: 'token expired'
		})
	}
	logger.error(error.message)
	next(error)
}

const validateToken = (request, response, next) => {
	const decodedToken = jwt.verify(request.token, Config.JWT_SECRET)
	if (!request.token || !decodedToken?.id) {
		return response.status(401).json({error: 'token missing or invalid'})
	}
	return decodedToken
}

const validateErrors = (request, response, next) => {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		response.status(400).json({error: errors.array()})
	}
}

const tokenExtractor = (request, response, next) => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		request.token = authorization.substring(7)
	}
	next()
}

const middleware = {errorHandler, validateToken, validateErrors, tokenExtractor}

export default middleware
