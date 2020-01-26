const fs = require("fs");

let directory = fs.readdirSync("./pageToHost");
let webpage = {};

directory.forEach(file => {
	webpage[file] = fs.readFileSync(`./pageToHost/${file}`, { encoding: "utf8" });
});

module.exports = webpage;
