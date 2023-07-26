const express = require("express");
const server = require("http").createServer();
const app = express();

// Create a route:
// Any requests that come in to "/", we want to respond with the static html file, "index.html"
// The index.html is located in the root directory with the name specified by __dirname
// __dirname: a reserved name, in Node.js, for the current directory
app.get("/", function (req, res) {
	res.sendFile("index.html", { root: __dirname });
});

// Make the server response request.
// app: the Express server that we created above
// So here, we make the Express server respond to all our requests via the HTTP server
server.on("request", app);
server.listen(3000, function () {
	console.log("Listening on 3000");
});

/** Begin websocket */
const WebSocketServer = require("ws").Server;

// Give the connection a name, wss.
// Attach the WebSocket to the server we created with Express.js earlier.
const wss = new WebSocketServer({ server: server });

// When the initial connection is created:
wss.on("connection", function connection(ws) {
	const numClients = wss.clients.size;
	console.log("Clients connected", numClients);

	wss.broadcast(`Current visitors ${numClients}`);

	if (ws.readyState === ws.OPEN) {
		ws.send("Welcome to my server");
	}

	ws.on("close", function close() {
		wss.broadcast(`Current visitors ${numClients}`);
		console.log("A client has disconnected");
	});
});

wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};
