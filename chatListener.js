const http = require("http");
const net = require("net");
const url = require("url");
const { Buffer } = require("buffer");
const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");
const QS = require("querystring");

const handlers = require("./handlers");

class Listener extends EventEmitter {
	constructor(path) {
		super();
		this.messages = [];
	}

	check() {
		if (this.messages.length > 50) {
			this.messages.splice(0, 25);
		}
	}

	add(m) {
		this.check();
		this.messages.push(m);
		this.emit("update", this.messages);
	}
}

function addKey(path, filename) {
	let fileData;

	if (fs.existsSync(filename)) {
		fileData = JSON.parse(fs.readFileSync(filename));
	} else {
		fileData = {};
		fs.writeFileSync(filename, JSON.stringify(fileData));
	}

	let currentData = fileData;

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

	fs.writeFileSync(filename, JSON.stringify(fileData));
}

let connectedClients = new Set();

let messages = new Listener();

let realtimeConnectionTCPsocket = net.createServer();

function onConnectionFunc(socket) {
	let address = socket.address();
	let addressStr = `${address.address}:${address.port}`;

	connectedClients.add(socket);

	socket.on("data", data => {
		let dirname = data
			.toString("utf8")
			.split(" ")[1]
			.split("?")[0];

		let chosenHandler = handlers[dirname.slice(1)]
			? handlers[dirname.slice(1)]
			: handlers.notFound;

		let messageObj = QS.parse(
			data
				.toString("utf8")
				.split(" ")[1]
				.split("?")[1],
		);
		chosenHandler(messageObj, statusCode => {
			let httpResponse = [];

			httpResponse.push(Buffer.from(`HTTP/1.1 ${statusCode} OK\r\n`));
			httpResponse.push(Buffer.from("Access-Control-Allow-Origin: *\r\n"));
			httpResponse.push(Buffer.from("Content-Type: application/json\r\n"));
			httpResponse.push(Buffer.from("Connection: close\r\n"));
			httpResponse.push(Buffer.from("\r\n"));

			if (statusCode === 200) {
				if (messageObj) {
					messages.add({
						client: addressStr,
						m: messageObj,
					});

					let chatType = messageObj.chatType;
					let pathname = `./database/${messageObj.chat}`;

					// if (chatType === "group") {
					addKey(["messages"], pathname);

					let fileData = JSON.parse(fs.readFileSync(pathname));

					fileData.messages.push(messageObj);

					fs.writeFileSync(pathname, JSON.stringify(fileData));
					// }
					httpResponse.push(
						Buffer.from("Broadcasting has been successful\r\n"),
					);
				} else {
					httpResponse.push(Buffer.from("There is no message\r\n"));
				}
			} else {
				httpResponse.push(Buffer.from("Broadcasting has failed\r\n"));
			}
			socket.write(Buffer.concat(httpResponse));
			socket.end();
		});
	});

	socket.on("close", hadError => {
		connectedClients.delete(socket);
	});

	socket.on("error", err => {
		console.log(err);
	});
}

let severRealtimeResponse = http.createServer((req, res) => {
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

		chosenHandler(string, statusCode => {
			if (statusCode === 200) {
				res.setHeader("Content-Type", "application/json");
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.writeHead(statusCode);

				messages.on("update", m => {
					res.end(JSON.stringify(m));
				});
			}
		});
	});
});

module.exports = {
	realtimeConnectionTCPsocket,
	onConnectionFunc,
	severRealtimeResponse,
};
