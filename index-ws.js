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

// Catch the interrupt signal when the server is closing
// Go thorough every single WebSocket connection, and close it
// And shut down the db connection before the server actually closes
process.on("SIGINT", () => {
	wss.clients.forEach(function each(client) {
		client.close();
	});
	server.close(() => {
		shutdownDB();
	});
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

	// datetime(): sqlite3's built-in function for time
	db.run(`
    INSERT INTO visitors (count, time)
    VALUES (${numClients}, datetime('now'))
  `);

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

/** end web sockets */
/** begin database */
const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

// Make sure our database is set up before any queries are ready to go
db.serialize(() => {
	db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts() {
	db.each("SELECT * FROM visitors", (err, row) => {
		console.log(row);
	});
}

// We need to close the database connection by the time the server is all done. We never want to leave a database connection open because it will just stay open persistently. Then you are going to run out of connections to your database.
function shutdownDB() {
	getCounts();
	console.log("Shutting down db");
	db.close();
}
