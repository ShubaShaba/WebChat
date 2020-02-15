const http = require("http");
const url = require("url");
const { Buffer } = require("buffer");
const path = require("path");

const webpage = require("./dataToHost");
const handlers = require("./handlers");
const chatListener = require("./chatListener");

const animation = require("./loadingAnimation.js");

let host = http.createServer((req, res) => {
	let URL = url.parse(req.url, true);
	let trimmedPath = URL.pathname.replace(/^\/+|\/+$/g, "");

	let dirname = path.dirname(trimmedPath);
	let basename = path.basename(trimmedPath);

	let buffer = [];

	req.on("data", chunk => {
		buffer.push(chunk);
	});

	req.on("end", () => {
		let chosenHandler = handlers[dirname]
			? handlers[dirname]
			: handlers.notFound;

		buffer = Buffer.concat(buffer);
		let string = buffer.toString("utf8");

		chosenHandler(string, statusCode => {
			res.statusCode = statusCode;

			if (statusCode === 200) {
				if (path.extname(trimmedPath) === ".html") {
					res.setHeader("Content-Type", "text/html");
				} else if (path.extname(trimmedPath) === ".css") {
					res.setHeader("Content-Type", "text/css");
				} else if (path.extname(trimmedPath) === ".js") {
					res.setHeader("Content-Type", "text/javascript");
				}

				if (webpage[basename]) {
					res.write(webpage[basename]);
					res.end();
				} else {
					res.end("Error in filename");
				}
			} else {
				res.end("Error: " + statusCode);
			}
		});
	});
});

host.listen(5000, "192.168.1.146", () => {
	console.log("Server 5000 is listening");
});

chatListener.realtimeConnectionTCPsocket.listen(8080, "192.168.1.146");

chatListener.realtimeConnectionTCPsocket.on("connection", socket => {
	chatListener.onConnectionFunc(socket);
});

chatListener.realtimeConnectionTCPsocket.on("listening", () => {
	console.log("Server 8080 is listening");
});

chatListener.severRealtimeResponse.listen(8081, "192.168.1.146", () => {
	console.log("Server 8081 is listening");
	animation();
});
