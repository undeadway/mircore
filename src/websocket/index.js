/**
 * 这里是 websocket 的基本服务器
 */
const WebSocketServer = require('websocket').server;
const filter = require("./../core/filter");
const Cookies = require("../components/public/cookies");

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
	// 这里可以考虑怎么插入 inspector
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
		let _callback = null;

		const req = Object.assign({
			parse: {
				path: request.resource || "/websocket",
				pathname: request.resource || "/websocket",
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
				_callback = callback;
			}
		};

		connection.on('message', function(message) {
			req.parse.query = message;
			filter(req, res);
		});

		connection.on('close', function(reasonCode, description) {
			console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
			_callback(connection, reasonCode, description);
		});

		connection.on('error', function(error) {
			console.log("Connection Error: " + error.toString());
		});
	});
}

module.exports = {
    create: createWebSocketServer
}