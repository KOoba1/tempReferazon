var express = require('express'),
db      = require('../db');
var app = module.exports = express.Router();
const axios = require('axios');

var awis = require('awis');
var client = awis({
  secret: 'P5OqFC44GVhWuHfSAAePD0v0vpXzxvnxdK5p8w3b',
  key: 'AKIAJZBZP2OEMHRQ3Q7A'
});


app.get( '/api/getSearchResults/:searchTerm/:page/:company' , async function(req, res) {

  var searchResults = [];
  var company = req.params.company; 
  try {    
   var searchResults =  await getSearchResults(req.params.searchTerm, req.params.page); 
 } catch (error) { console.log(error) }
    //console.log(searchResults.data.items); 
    var domainList = searchResults.data.items.map(item => { 
      return { 
        domain:getDomainFromLink(item.link),
        link:item.link, 
        secure:isHttps(item.link),
       // title:item.title
     }
   })
    
    console.log("domain list is: " , domainList); 

    var urls = domainList.map( item => { return item.domain }) ; 

   urls = [...new Set(urls)]; // remove duplicates 
 /*
  var urls = [
  'peta.org', 'arbookfind.com', '3mhalfmarathon.com',   'curiosityandcomfyshoes.com'
   ,'peta.org', 'arbookfind.com', '3mhalfmarathon.com',   'curiosityandcomfyshoes.com'
  ];
  */
  console.log('Urls are: ' , urls); 


  var clientObject = {
    Action: 'UrlInfo',
    'UrlInfo.Shared.ResponseGroup': 'LinksInCount,SiteData,Rank,UsageStats',
  };

  var endIterate = urls.length > 4 ? 5 : urls.length; 
  for (var i = 0 ; i < endIterate ; i++ ) {
    clientObject['UrlInfo.' + (i+1) + '.Url'] =  urls[i];
  }

  var clientObject2 = {
    Action: 'UrlInfo',
    'UrlInfo.Shared.ResponseGroup': 'LinksInCount,SiteData,Rank,UsageStats',
  };

  if ( urls.length > 5 ) {
    for (var i = 5 ; i < urls.length ; i++ ) {
      clientObject2['UrlInfo.' + (i-4) + '.Url'] =  urls[i];
    }}

    //console.log('Client Object is: ' , clientObject); 
    //console.log('Client Object2 is: ' , clientObject2); 
    var retVal = {} ;
    var domainsAwis = [] ;
    client( clientObject , function (err, data) {
      console.log('AWIS Error is: ' , err); 

      data.forEach(function (item) {    domainsAwis.push(formatAwisItem(item))  });
      console.log("Finished first client object"); 

      client( clientObject2 , async function (err2, data2) { 
        console.log('AWIS Error is2: ' , err2); 
        console.log("inside second client obj"); 
        data2.forEach(function (item) {    domainsAwis.push(formatAwisItem(item))  });
        retVal.domainsAwis = domainsAwis; 
        retVal.existingDomains =  await getExistingDomains(urls, company); 
        retVal.domainList = domainList; //used to get the links from domains 
        console.log('existing domains are' , retVal.existingDomains);
        res.json( retVal )  ; 
      });
      
      
    });


  });

async function  getExistingDomains(urls, company){
  var urlString = urls.join("','")
  var results = await db.get().query(`SELECT Domain FROM company_domain 
    WHERE Domain IN ('${urlString}')  AND Company = '${company}'  ` ) ;
  console.log('get exisitng domains results are: ' , results)
  return results.map( item => item.Domain ) ; 
}


function formatAwisItem(item) {
  var retObject = {};
  console.log(item); 
  retObject.LinksIn = item.contentData.linksInCount; 
  retObject.Domain = item.contentData.dataUrl ; 
  
  try {
    retObject.Usage = item.trafficData.usageStatistics.usageStatistic[0].reach.perMillion.value ;
  } catch(e){
    retObject.Usage = null; 
  }
  
  retObject.Rank = item.trafficData.rank ; 
  return retObject; 
}

function getAWISData(domains){

 
  var urls = domains.map( item => { return item.domain }) ; 
  console.log('Urls are: ' , urls); 


  var clientObject = {
    Action: 'UrlInfo',
    'UrlInfo.Shared.ResponseGroup': 'LinksInCount,SiteData,Rank,UsageStats',
  //'UrlInfo.1.Url': 'www.happypreppers.com',

  //'UrlInfo.2.Url': 'yahoo.com'
};

for (var i = 0 ; i < urls.length ; i++ ) {
  clientObject['UrlInfo.' + (i+1) + '.Url'] =  urls[i];
}

console.log('Client Object is: ' , clientObject); 

client( clientObject , function (err, data) {
  console.log('AWIS Error is: ' , err); 
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
  
  return retVal ; 
});


}

function getSearchResults(searchTerm,page){
  
  var searchAppend = ' "is a participant in the amazon services llc associates program"' ; 
  //var searchAppend = ' "participant in the amazon services llc associates program"' ; 
 // var searchPrepend = 'allintext:"amazon services llc associates program" '
 

  var searchQuery = 
  'https://www.googleapis.com/customsearch/v1?key=' + 
  'AIzaSyDfrM-1Yfkqs8nTMq4Qp4_igS8xQhzS7F8'
 //     'AIzaSyC3kGcdZ4P5cE2ZxGN19WwNFyr_g4o2T-4'
 + '&cx=003429913069680451282:ffpf7-envl0' 
 + '&start=' + (((page - 1 )* 10) + 1 ) 
 + '&q='
 +  searchTerm + searchAppend;
 console.log(searchQuery);
 return axios.get(searchQuery);


}


const extractDomain = require('extract-domain');

function getDomainFromLink(link){
 
  //var hostname = (new URL(link)).hostname;
  return extractDomain(link);  
}

function isHttps(link){
  if( link.substring(0,5 )  == 'https') {
    return true;
  } else { return false}
}