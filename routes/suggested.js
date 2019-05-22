var express = require('express'),
    db      = require('../db');
var app = module.exports = express.Router();
var rp = require('request-promise');
var parseString = require('xml2js').parseString;
app.get( '/api/getSuggestedTerms/:searchTerm' ,  function(req, res) {

  var searchTerm = encodeURIComponent(req.params.searchTerm) ; 
  var query = 'http://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=' + searchTerm ;
  console.log(query);
//http://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=best fundraiser bracelets
  rp( query )
    .then(function (htmlString) {
     
        parseString(htmlString, function (err, result) {
            console.dir(result);
            var retVal = result.toplevel.CompleteSuggestion.map( item => { 
                return item.suggestion[0].$.data ; 
                 }) ; 
             res.json(retVal);  
        });
       
        // Process html...
    })
    .catch(function (err) {
       console.log(err); 
       res.json({"error":"error"});  
    });

 
	
});


