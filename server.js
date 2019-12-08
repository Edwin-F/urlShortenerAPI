'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);//
mongoose.set('useUnifiedTopology', true);//

var cors = require('cors');
var bodyParser = require('body-parser');

var urlHandler = require('./controllers/urlHandler.js');

var app = express();

//Basic Configuration for database
var mongoURL = process.env.DATABASE;

// Basic Configuration
var port = process.env.PORT || 3000;


mongoose.connect(mongoURL, { useNewUrlParser: true });


app.use(cors());

// body-parsed is used to parse Post bodies
app.use(bodyParser.urlencoded({'extended': false}));


// Routes for web
app.use('/public', express.static(process.cwd() + '/public'));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
app.get('/api/hello', function(req, res) {
  res.json({greeting: 'hello ApI'});
});

app.post('/api/shorturl/new', urlHandler.addUrl);

app.get('/api/shorturl/:shurl', urlHandler.processShortUrl);

app.get('/api/shurl/', function(req, res) {
    let shurl = req.query.shurl;
    res.redirect('/api/shorturl/' + shurl);
});
// Answer not found to all the wrong routes
app.use(function(req, res, next) {
  res.status(400);
  res.type('txt').send('Not found');
});


app.listen(port, function() {
  console.log('Node.js listening...');
});
