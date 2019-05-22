var express = require('express'),
    db      = require('../db');
var app = module.exports = express.Router();

  const axios = require('axios');


app.get( '/api/getDomainEmails/:domain' , async  function(req, res) {

  var domain = req.params.domain; 
  var dbResults = true; 
  var result = await db.get().query(`SELECT Emails FROM 
                                      domain_details WHERE Domain = '${domain}' 
                                      LIMIT 1` ) ;

  console.log(result.length); 
  if ( result.length != 0  ) {
    console.log(result[0].Emails); 
    res.json(JSON.parse(result[0].Emails)); 

  } else {
       var emails = (await getEmailsFromHunter(domain)).data.data.emails;
       console.log(emails);
        var result = await db.get()
        .query(`INSERT INTO domain_details (Emails,Domain)
        VALUES ('${JSON.stringify(emails)}','${domain}') ` ) ;
        res.json(emails); 
  }

	
});


function getEmailsFromHunter(domain) {


  var url = 'https://api.hunter.io/v2/domain-search?domain=' + 

  domain + '&api_key=710f0e0f4247b8105d0f81d8c067e300d4e4f3c7';


return axios.get(url); 

}