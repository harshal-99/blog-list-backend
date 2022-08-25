import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import blogsRouter from "./controllers/blogs.js";
import morgan from "morgan";
import Config from "./utils/config.js";
import "express-async-errors"
import middleware from "./utils/middleware.js";
import usersRouter from "./controllers/users.js";
import loginRouter from "./controllers/login.js";
import healthRouter from "./controllers/healthRouter.js";

const app = express()


void mongoose.connect(Config.MONGODB_URI)

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/health', healthRouter)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

app.use(middleware.tokenExtractor)
app.use('/api/blogs', blogsRouter)


app.use(middleware.errorHandler)

export default app
