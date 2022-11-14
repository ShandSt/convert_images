const express = require('express');
const app = express();
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
const https = require('https');
const Images = require('../models/Image');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('./WebSocketServer');
const awsS3 = require('../aws/s3.js');
require('dotenv').config();

AWS.config.update({
  region: 'us-west-2',
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.SECRET_ACCESS_KEY
});

// WebSocketServer.on('open', function open() {
// 	WebSocketServer.send('something');
// 	console.log('ws send');
// });
// WebSocketServer.on('message', function message(data) {
// 	console.log('received: %s', data);
// });


const consumer = Consumer.create({
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/213324592790/download-convert-image',
  handleMessage: async (message) => {  
	const image = await Images.findOne({ queueId: message.MessageId, convert: true});
	console.log('start');


	const img = await awsS3.getImage(image.imageS3);

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

module.exports = { consumer };