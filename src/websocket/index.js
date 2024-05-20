const WebSocketServer = require('websocket').server;
const filter = require("./../core/filter");
const Cookies = require("../components/public/cookies");

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

function createWebSocketServer(httpServer) {
	const wsServer = new WebSocketServer({
		httpServer: httpServer,
		// You should not use autoAcceptConnections for production
		// applications, as it defeats all standard cross-origin protection
		// facilities built into the protocol and the browser.  You should
		// *always* verify the connection's origin and decide whether or not
		// to accept it.
		autoAcceptConnections: false
	});

	wsServer.on('request', function(request) {
		if (!originIsAllowed(request.origin)) {
		  // Make sure we only accept requests from an allowed origin
			request.reject();
			console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
			return;
		}

		const connection = request.accept('echo-protocol', request.origin);
		console.log((new Date()) + ' Connection accepted.');

		connection.on('message', function(message) {

			const req = Object.assign({
				parse: {
					query: message,
					path: "/websocket",
					pathname: "/websocket",
					cookies: {req: Cookies.createRequestCookies(), res: Cookies.createResponseCookies()}
				},
				method: "ws"
			}, request), res = {
				write (type, data) {
					if (type === 'utf8') {
						connection.sendUTF(data);
					} else if (type === 'binary') {
						connection.sendBytes(data);
					}
				},
				end (callback) {
					connection.on('close', callback);
				}
			};

			filter(req, res);
		});
	});
}

module.exports = {
    create: createWebSocketServer
}