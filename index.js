const images = require('./routes/images');
const express = require('express');
const app = express();
const session = require('express-session');

app.use(session({
    secret: '34SDgsdgsp23d22s32dfsG', // just a long random string
    resave: false,
    saveUninitialized: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.use(express.static(__dirname, 'public'));
app.use('/api/images', images);

//const host = req.host;
//const filePath = req.protocol + "://" + host + '/' + req.file.path;


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));