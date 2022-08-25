import http from "http";
import app from "./app.js";
import Config from "./utils/config.js";

const server = http.createServer(app)


server.listen(Config.PORT, () => {
	console.log(`Server running on port ${Config.PORT}`)
})
