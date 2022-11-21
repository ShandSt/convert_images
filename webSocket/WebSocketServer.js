const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server: server});

wss.on('connection', function connection(wss) {
  wss.on('message', function message(data) {
		console.log('received: %s', data);
	});
});

const port = 4000;
server.listen(port, () => console.log(`Ws listening on port ${port}...`));

module.exports = wss;