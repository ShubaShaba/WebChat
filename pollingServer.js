const http = require("http");
const url = require("url");
const { Buffer } = require("buffer");
const fs = require("fs");
const EventEmitter = require("events");

const handlers = require("./handlers");

class Data extends EventEmitter {
	constructor(path) {
		super();
		this.stringData = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
	}

	edit(path) {
		let newData = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));

		let newMessageObj = newData.messages;
		let oldMessageObj = this.stringData.messages;

		let updates = [];

		for (key in newMessageObj) {
			if (
				newMessageObj.key[newMessageObj.keys.length - 1] !=
				oldMessageObj.key[oldMessageObj.keys.length - 1]
			) {
				updates.push(newMessageObj.key[newMessageObj.keys.length - 1]);
			}
		}

		this.stringData = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
		this.emit("update", JSON.stringify(updates));
	}
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

		let string = buffer.toString("utf8");

		let pathname = `./database/${URL.query.chat}`;
		let data = new Data(pathname);
		data.edit(pathname);

		chosenHandler(string, statusCode => {
			res.setHeader("Content-Type", "application/json");
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.writeHead(statusCode);

			if (statusCode === 200) {
				data.on("update", m => {
					res.end(m);
				});
			} else {
				res.end("Error: " + statusCode);
			}
		});
	});
});

module.exports = server;
