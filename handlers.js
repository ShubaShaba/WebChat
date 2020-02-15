let handlers = {};

handlers.notFound = function(data, callback) {
	callback(404);
};

handlers.getPage = function(data, callback) {
	callback(200);
};

handlers.addMessage = function(data, callback) {
	callback(200);
};

handlers.update = function(data, callback) {
	callback(200);
};

handlers.realtimeUpdate = function(data, callback) {
	callback(200);
};

module.exports = handlers;
