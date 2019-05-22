if (process.env.USING_NOW != 'true')  {
	console.log("not using NOW (Development)") ;
require('dotenv').config() ;
} else {
	console.log("using NOW (production");
}

var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

var history = require('connect-history-api-fallback'); //used for history mode, clean URLS
app.use(history());


var cors = require('cors');

var db = require('./db');

db.connect();

app.set('port', 3000);

app.use(cors()); //after the line app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use( express.static( __dirname + '/public' ));

app.get( '/', function( req, res ) {
    res.sendFile( path.join( __dirname, 'public', 'index.html' ));
  });

/*
var quotes = require('./routes/quotes');
app.use(quotes);
*/

var router = require('./router');
app.use(router );


app.get('/api/test',function(request,response){
  response.end('{"test"}');
  });


//---------
/*
var awis = require('awis');

var client = awis({
  secret: 'P5OqFC44GVhWuHfSAAePD0v0vpXzxvnxdK5p8w3b',
  key: 'AKIAJZBZP2OEMHRQ3Q7A'
});

client({
  Action: 'UrlInfo',
  'UrlInfo.Shared.ResponseGroup': 'Categories',
  'UrlInfo.1.Url': 'www.happypreppers.com',

  'UrlInfo.2.Url': 'yahoo.com'
}, function (err, data) {
  console.log(err); 
  // res.length === 5
  // data is an array with a response object for each domain
  data.forEach(function (item) {
    console.log(item);
  });
});
*/
/*
client({
  'Action': 'UrlInfo',
  'Url': 'peta.org',
  'ResponseGroup': 'Related,TrafficData,ContentData'
}, function (err, data) {
   console.log(err); 
   console.log(data);
  //console.log(data.trafficData.usageStatistics.usageStatistic[0]); 
});
*/
//-------

app.listen(app.get('port')) ;

console.log('Running App');

