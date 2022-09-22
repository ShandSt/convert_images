const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      cb(new Error('Please upload an image.'))
    }
    cb(undefined, true);
  }
});

const genres = [
  { id: 1, name: 'Action' },  
  { id: 2, name: 'Horror' },  
  { id: 3, name: 'Romance' },  
];

router.get('/', (req, res) => {
  res.send(genres);
});

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      console.log(req.sessionID)
      // const incident = await Incident.findById(req.body.id);
      // incident.image = req.file.buffer;
      // incident.save();
      res.send();
    } catch (e){
      console.log(222);
      res.status(400).send(e);
    }
  }, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});



const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, '/src/images');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname);
  }
});



module.exports = router;