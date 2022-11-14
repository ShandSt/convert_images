const express = require('express');
const app = express();
const images = require('./routes/images');
const listener = require('./listener/listener');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.use(express.static(__dirname, 'public'));
app.use('/api/images', images);

//const host = req.host;
//const filePath = req.protocol + "://" + host + '/' + req.file.path;

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

listener.consumer.on('error', (err) => {
  console.log(err.message);
});
app.on('processing_error', (err) => {
  console.error(err.message);
});
listener.consumer.start();