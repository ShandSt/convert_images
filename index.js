const express = require('express');
const app = express();
const images = require('./routes/images');
// const server = require('http').createServer(app);
// const { WebSocketServer } = require('ws');
// const wss = new WebSocketServer({ server: server});
const listener = require('./listener/listener');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.use(express.static(__dirname, 'public'));
app.use('/api/images', images);

// wss.on('connection', function connection(wss) {
// 	// wss.send(listener.handleMessage);
// 	// wss.send('listener.imageReady');

// 	wss.on('message', function message(data) {
// 		console.log('received: %s', data);
// 	});
// });

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

listener.consumer.on('error', (err) => {
  console.log(err.message);
});
app.on('processing_error', (err) => {
  console.error(err.message);
});
listener.consumer.start();