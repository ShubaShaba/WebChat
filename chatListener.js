const http = require("http");
const net = require("net");
const url = require("url");
const { Buffer } = require("buffer");
const EventEmitter = require("events");
const fs = require("fs");

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

let connectedClients = new Set();

let messages = new Listener();

let realtimeConnectionTCPsocket = net.createServer();

function onConnectionFunc(socket) {
	let address = socket.address();
	let addressStr = `${address.address}:${address.port}`;

	connectedClients.add(socket);

	socket.on("data", data => {
		connectedClients.forEach(otherSocket => {
			let otherAddress = otherSocket.address();
			let otherAddressStr = `${otherAddress.address}:${otherAddress.port}`;

			let messageObj = QS.parse(
				data
					.toString("utf8")
					.split(" ")[1]
					.split("?")[1],
			);
			// add addMessage handler
			if (messageObj) {
				messages.add({
					client: otherAddressStr,
					m: messageObj,
				});

				let chatType = messageObj.chatType;
				let pathname = `./database/${messageObj.chat}`;

				let fileData;

				if (chatType === "group") {
					addKey(["messages"], pathname);

					fileData.messages.push(messageObj);

					fs.writeFileSync(pathname, JSON.stringify(fileData));
				}
			}

			otherSocket.end();
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
		buffer = Buffer.concat(buffer);
		let string = buffer.toString("utf8");

		let statusCode = 200; //add realtimeUpdate handler

		res.setHeader("Content-Type", "application/json");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.writeHead(statusCode);

		messages.on("update", m => {
			res.end(JSON.stringify(m));
		});
	});
});

module.exports = {
	realtimeConnectionTCPsocket,
	onConnectionFunc,
	severRealtimeResponse,
};

// let chatListenerHTTPServerToEditDB = http.createServer((req, res) => {
// 	let URL = url.parse(req.url, true);
// 	let trimmedPath = URL.pathname.replace(/^\/+|\/+$/g, "");

// 	let buffer = [];

// 	req.on("data", chunk => {
// 		buffer.push(data);
// 	});

// 	req.on("end", function() {
// 		let chosenHandler = handlers[trimmedPath]
// 			? handlers[trimmedPath]
// 			: handlers.notFound;

// 		buffer = Buffer.concat(buffer);

// 		let message = URL.query;
// 		let from = message.from;
// 		let chatType = message.chatType;
// 		let pathname = `./database/${message.chat}`;

// 		chosenHandler(message, statusCode => {
// 			res.setHeader("Content-Type", "application/json");
// 			res.setHeader("Access-Control-Allow-Origin", "*");
// 			res.writeHead(statusCode);

// 			if (statusCode === 200) {
// 				if (message) {
// 					let data;

// 					if (chatType === "group") {
// 						addKey(["messages"], pathname);

// 						data.messages.push(message);

// 						fs.writeFileSync(pathname, JSON.stringify(data));
// 					}
// 				}
// 				res.end();
// 			} else {
// 				res.end("Error: " + statusCode);
// 			}
// 		});
// 	});
// });
