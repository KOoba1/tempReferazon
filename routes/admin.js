var express = require('express'),
    db      = require('../db');
var app = module.exports = express.Router();
var axios =require( 'axios' ) ; 

var AWS = require('aws-sdk');

//https://api.hunter.io/v2/account?api_key=XXXXXXXX

app.get('/api/getAdminData' , async function(req,res) {

  
    var retVal = {
      test:'test'
     }; 
       try {
     //  domain + '&api_key=710f0e0f4247b8105d0f81d8c067e300d4e4f3c7';
     var hunter = await axios.get('https://api.hunter.io/v2/account?api_key='+ process.env.HUNTER_API); 
    retVal.hunter = hunter.data.data ; 

    
     var domainCompanyResults = await db.get()
     .query(`SELECT COUNT(*) as 'Number Of Domains', MAX(ModTime) AS 'Last Action' , Company 
      from company_domain GROUP BY Company ORDER BY 'Last Action' DESC  `);

      var users = await db.get()
     .query(`SELECT Firstname, Lastname, Email, Company, Role, Password, EntryDate AS 'CreatedDate' ,  ModTime AS 'LastAction' 
      from user GROUP BY  UserId ORDER BY EntryDate DESC  `);

     retVal.users = users; 
    retVal.domainCompany = domainCompanyResults ; 


     var alexaUsage = await getAlexaUsage(); 
    
     retVal.alexaUsage = alexaUsage ; 

      } catch (e){ console.log(e); }
   
    res.json(retVal); ;
 

})

async function getAlexaUsage() {
//https://github.com/dnavarrom/aws-cost-explorer/blob/master/lib/CostExplorer.js
  var config = { 
    apiVersion: '2017-10-25',
    accessKeyId : 'AKIATCRRFZ2OLNLLSPCB',
    secretAccessKey : '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',
    region : 'us-east-1'
}

 //https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/API_GetCostAndUsage.html
 var awsCostExplorer = new AWS.CostExplorer(config);

  var myData = await awsCostExplorer.getCostAndUsage(
    {
      TimePeriod: {
            End: '2019-05-10', 
            Start: '2019-03-04' 
        } ,
        Granularity: 'MONTHLY',
        Metrics: ['NormalizedUsageAmount','UsageQuantity','BlendedCost'],
        GroupBy: [ { Key:'SERVICE', Type:'DIMENSION'}]
      }).promise(); 
  
  console.log(myData); 
  return myData; 
}