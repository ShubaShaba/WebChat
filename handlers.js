let handlers = {};

handlers.notFound = function(data, callback) {
	callback(404);
};

handlers.getData = function(data, callback) {
	callback(200);
};

handlers.addMessage = function(data, callback) {
	callback(200);
};

handlers.update = function(data, callback) {
	callback(200);
};

module.exports = handlers;
