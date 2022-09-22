const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, 'uploads/');
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    //callback(null, file.fieldname + '-' + uniqueSuffix);
    callback(null , 'upload_at_' + uniqueSuffix + path.extname(file.originalname)); 
  }
});
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1000000,
  },
  storage: storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      cb(new Error('Please upload an image.'))
    }
    cb(undefined, true);
  }
}).single("file");

const genres = [
  { id: 1, name: 'Action' },  
  { id: 2, name: 'Horror' },  
  { id: 3, name: 'Romance' },  
];

router.get('/', (req, res) => {
  res.send(genres);
});

router.post('/upload',  async (req, res) => {
      upload(req, res, (err) => {
        if(err) {
          res.status(400).send("Something went wrong!");
        }
          console.log(req);
        try {
          //console.log(req.sessionID)
          // const incident = await Incident.findById(req.body.id);
          // incident.image = req.file.buffer;
          // incident.save();
          //res.send('Complete');
        } catch (e){
          res.status(400).send(e);
        }
        res.send(req.file);
      });
  }, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});




module.exports = router;