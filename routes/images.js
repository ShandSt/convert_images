const express = require('express');
const router = express.Router();
const multer = require('multer');
const awsS3 = require('../aws/s3.js');
const awsSqs = require('../aws/sqs.js');
const path = require('path');
const fs = require('fs');
const Images = require('../models/Image');

// const storage = multer.diskStorage({
//   destination: function(req, file, callback) {
//     callback(null, 'uploads/');
//   },
//   filename: function (req, file, callback) {
//     callback(null , 'upload_at_' + uniqueSuffix + path.extname(file.originalname)); 
//   }
// });

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1000000,
  },
  //storage: storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      cb(new Error('Please upload an image.'));
    }
    cb(undefined, true);
  },
}).single('file');

const genres = [
  { id: 1, name: 'Action' },  
  { id: 2, name: 'Horror' },  
  { id: 3, name: 'Romance' },  
];

router.get('/', (req, res) => {
  res.write('Hello world');
	res.end();
});

router.post('/upload',  async (req, res) => {
      upload(req, res, async (err) => {
        if(err) {
          res.status(400).send(err);
        }

        try {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileName = 'upload_at_' + uniqueSuffix + path.extname(req.file.originalname); 
          const fileBlob = fs.readFileSync(req.file.path);

          await awsS3.sendS3(fileName, fileBlob);            
          const data = await awsSqs.sendMessage(req.body.sessionId)
          const imageS3 = new Images({
            seesionId: req.body.sessionId, 
            imageS3: fileName, 
            action:  req.body.action, 
            queueId: data.MessageId,
            convert: false
          })
          imageS3.save((err, doc) => {
            if (!err) {
                console.log('success', 'Image added successfully!');
            } else {
                console.log('Error during record insertion : ' + err);
            }
          });  
          
          res.send(req.file);
        } catch (e){
          res.status(400).send(e);
        }    
        res.end();
      });
  }, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.get('/getConvertImage', async (req, res) => {
  const image = await Images.findOne({ seesionId: req.sessionId, convert: true});
  const img = await awsS3.getImage(image.imageS3);

  res.send(`data:image/png;base64,${toBase64(img)}`);
	res.end();
});

function toBase64(arr) {
   //arr = new Uint8Array(arr) if it's an ArrayBuffer
   return btoa(
      arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
   );
}

module.exports = router;