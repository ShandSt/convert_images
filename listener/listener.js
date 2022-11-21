const express = require('express');
const app = express();
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
const https = require('https');
const Images = require('../models/Image');
const awsS3 = require('../aws/s3.js');
const server = require('http').createServer(app);
const { WebSocketServer } = require('ws');
require('dotenv').config();

AWS.config.update({
  region: 'us-west-2',
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const wss = new WebSocketServer({ server: server});

const consumer = Consumer.create({
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/213324592790/download-convert-image',
  handleMessage: async (message, imageReady) => {  
    console.log('start');
    const image = await Images.findOne({ queueId: message.MessageId, convert: true});
    const img = await awsS3.getImage(image.imageS3);

    const obj = { text: 'ready!' };
    wss.on('connection', function connection(wss) {
      wss.send(obj.text);
    });

    console.log(img);
    console.log('finish');
  },
  sqs: new AWS.SQS({
    httpOptions: {
      agent: new https.Agent({
        keepAlive: true
      })
    }
  })
});

wss.on('connection', function connection(wss) {
  wss.on('message', function message(data) {
		console.log('received: %s', data);
	});
});

const port = 4000;
server.listen(port, () => console.log(`Ws listening on port ${port}...`));

module.exports = { consumer };