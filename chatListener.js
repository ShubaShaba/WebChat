const http = require("http");
const url = require("url");
const { Buffer } = require("buffer");
const handlers = require("./handlers");
const fs = require("fs");

let data;

function addKey(path, filename) {
	if (fs.existsSync(filename)) {
		data = JSON.parse(fs.readFileSync(filename));
	} else {
		data = {};
		fs.writeFileSync(filename, JSON.stringify(data));
	}

	let currentData = data;

	path.forEach((key, i, a) => {
		if (!(key in currentData) && !(i === a.length - 1)) {
			currentData[key] = {};
		}

		if (!(i === a.length - 1)) {
			currentData = currentData[key];
		} else if (!(key in currentData)) {
			currentData[key] = [];
		}
	});

	fs.writeFileSync(filename, JSON.stringify(data));
}

let server = http.createServer((req, res) => {
	let URL = url.parse(req.url, true);
	let trimmedPath = URL.pathname.replace(/^\/+|\/+$/g, "");

	let buffer = [];

	req.on("data", chunk => {
		buffer.push(data);
	});

	req.on("end", function() {
		let chosenHandler = handlers[trimmedPath]
			? handlers[trimmedPath]
			: handlers.notFound;

		buffer = Buffer.concat(buffer);

		let message = URL.query;
		let from = URL.query.from;
		let pathname = `./database/${URL.query.chat}`;

		chosenHandler(message, statusCode => {
			res.setHeader("Content-Type", "application/json");
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.writeHead(statusCode);

			if (statusCode === 200 && trimmedPath === "addMessage") {
				if (message) {
					addKey(["messages", from], pathname);

					data.messages[from].push(message);

					fs.writeFileSync(pathname, JSON.stringify(data));
				}
				res.end();
			} else {
				res.end("Error: " + statusCode);
			}
		});
	});
});

module.exports = server;
