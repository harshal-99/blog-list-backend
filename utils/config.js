import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const PORT = process.env.PORT || 3003;

const MONGODB_URI = process.env.NODE_ENV === 'test'
	? process.env.TEST_MONGODB_URI
	: process.env.MONGODB_URI;

const JWT_SECRET = process.env.JWT_SECRET

const ConfigSchema = Joi.object({
	PORT: Joi.number().required(),
	MONGODB_URI: Joi.string().default('mongodb://localhost/blog-list').required(),
	JWT_SECRET: Joi.string().default('SECRET').required(),
})


const {value: Config, error} = ConfigSchema.validate({PORT, MONGODB_URI, JWT_SECRET})

if (error) {
	throw new Error(error.message);
}

export default Config
