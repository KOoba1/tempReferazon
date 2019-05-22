var express = require('express') ;
var app = module.exports = express.Router();

//https://stackoverflow.com/questions/35749288/separate-file-for-routes-in-express]


var user = require('./routes/user');
app.use(user);

var admin = require('./routes/admin');
app.use(admin);

var awis = require('./routes/awis');
app.use(awis);

var search = require('./routes/search');
app.use(search);

var suggested = require('./routes/suggested');
app.use(suggested);

var socialMedia = require('./routes/socialMedia');
app.use(socialMedia);


var tracking = require('./routes/tracking');
app.use(tracking);


var domainEmails = require('./routes/domainEmails');
app.use(domainEmails);


var affiliates = require('./routes/affiliates');
app.use(affiliates);