const express = require('express');
const app = express();
const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
const https = require('https');
const Images = require('../models/Image');
const path = require('path');
const fs = require('fs');
const awsS3 = require('../aws/s3.js');
const { WebSocketServer } = require('ws');
require('dotenv').config();

AWS.config.update({
  region: 'us-west-2',
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const wss = new WebSocketServer({ port: 8080 });

const consumer = Consumer.create({
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/213324592790/download-convert-image',
  handleMessage: async (message) => {  
    console.log('start');
    const image = await Images.findOne({ queueId: message.MessageId, convert: true});
    const img = await awsS3.getImage(image.imageS3);

    wss.on('connection', function connection(ws) {
      ws.on('message', function message(data) {
        console.log('received: %s', data);
      });

      console.log('Image ' + img.seesionId + ' ready!');
      ws.send('Image ' + img.seesionId + ' ready!');
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

module.exports = { consumer };