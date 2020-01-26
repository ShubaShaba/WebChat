const http = require("http");
const url = require("url");
const { Buffer } = require("buffer");

const webpage = require("./dataToHost");
const handlers = require("./handlers");
const chatListener = require("./chatListener");
const pollingServer = require("./pollingServer");
const animation = require("./loadingAnimation.js");

function checkRequestHTML(path) {
	if (path.slice(path.length - 5, path.length) === ".html") return true;
	else return false;
}
function checkRequestCSS(path) {
	if (path.slice(path.length - 4, path.length) === ".css") return true;
	else return false;
}
function checkRequestJS(path) {
	if (path.slice(path.length - 3, path.length) === ".js") return true;
	else return false;
}

let host = http.createServer((req, res) => {
	let URL = url.parse(req.url, true);
	let trimmedPath = URL.pathname.replace(/^\/+|\/+$/g, "");

	let buffer = [];

	req.on("data", chunk => {
		buffer.push(chunk);
	});

	req.on("end", () => {
		let chosenHandler = handlers[trimmedPath.slice(0, 7)]
			? handlers[trimmedPath.slice(0, 7)]
			: handlers.notFound;

		buffer = Buffer.concat(buffer);
		let string = buffer.toString("utf8");

		chosenHandler(string, statusCode => {
			res.statusCode = statusCode;

			if (statusCode === 200) {
				if (checkRequestHTML(trimmedPath)) {
					res.setHeader("Content-Type", "text/html");
				} else if (checkRequestCSS(trimmedPath)) {
					res.setHeader("Content-Type", "text/css");
				} else if (checkRequestJS(trimmedPath)) {
					res.setHeader("Content-Type", "text/javascript");
				}

				if (webpage[trimmedPath.slice(8)]) {
					// directory name
					res.write(webpage[trimmedPath.slice(8)]);
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

host.listen(5000, () => {
	console.log("Server 5000 is listening");
});

chatListener.listen(8080, () => {
	console.log("Server 8080 is listening");
});

// pollingServer.listen(3000, () => {
// 	console.log("Server 3000 is listening");
// 	animation();
// });
