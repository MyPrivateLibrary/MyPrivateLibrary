var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var path = require('path');

var bodyParser = require('body-parser');
var express = require('express');
var mongoose = require('mongoose');
var logger = require('morgan');
var swig  = require('swig');
var sessions = require('client-sessions');
var bcrypt = require('bcryptjs');
var csrf = require('csurf');


var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var routes = require('./app/routes');

var config = require('./config');

var RoutingContext = Router.RoutingContext;

var app=express();
app.set('port',process.env.PORT || 3000 );
app.use(logger('dev'));
app.use(bodyParser.json());
app.use (bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));

app.use(function(req, res) {
  Router.match({ routes: routes, location: req.url }, function(err, redirectLocation, renderProps) {
    if (err) {
      res.status(500).send(err.message);
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      var html = ReactDOM.renderToString(<RoutingContext {...renderProps} />);
      var page = swig.renderFile('views/index.html', { html: html });
      res.status(200).send(page);
    } else {
      res.status(404).send('Page Not Found');
    }
  });
});


mongoose.connect(config.database);
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB');
});

var server = require('http').createServer(app);

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
