var express = require('express'),
    db      = require('../db');
var app = module.exports = express.Router();



app.get( '/api/getAwisInfo/:urls' , function(req, res) {

	var awis = require('awis');
	var urls = req.params.urls.split(',')
	console.log(urls); 

var client = awis({
  secret: 'P5OqFC44GVhWuHfSAAePD0v0vpXzxvnxdK5p8w3b',
  key: 'AKIAJZBZP2OEMHRQ3Q7A'
});



var clientObject = {
  Action: 'UrlInfo',
  'UrlInfo.Shared.ResponseGroup': 'LinksInCount,SiteData',
  //'UrlInfo.1.Url': 'www.happypreppers.com',

  //'UrlInfo.2.Url': 'yahoo.com'
};

for (var i = 0 ; i < urls.length ; i++ ) {
	clientObject['UrlInfo.' + (i+1) + '.Url'] =  urls[i];
}

console.log(clientObject); 

client( clientObject , function (err, data) {
  console.log(err); 
  var retVal = [];
  // res.length === 5
  // data is an array with a response object for each domain
  data.forEach(function (item) {
    console.log(item);

    var retObject = {};
    //retObject.CreatedDate = ;
    retObject.LinksIn = item.contentData.linksInCount; 
    retObject.Domain = item.contentData.dataUrl ; 
     retVal.push(retObject);
  });
 
  res.json(retVal);
});

	
});

