var express = require('express'),
    db      = require('../db');
var app = module.exports = express.Router();
//var jwtDecode = require('jwt-decode'); 

app.post( '/api/trackDomain' ,  function(req, res) {
// var token = req.body.token || req.query.token || req.headers['x-access-token'];
//  var userId = jwtDecode(token).UserId; 


var sql = "INSERT INTO company_domain SET ? " ;

var insertData  = req.body ; 
insertData.Status = 'Pending Outreach' ; 

 db.get().query( sql , insertData,  function(err,rows,fields) {
    if (err) {
      console.log(err);
       res.status(500).send('SQL Error')
    }

   
    res.json({message:"success"}); 
 });

});


app.post( '/api/updateDomainStatus' ,  function(req, res) {

var updateData  = req.body ; 
console.log(updateData); 

var sql = "UPDATE company_domain SET Status = ? WHERE Domain = ? AND Company = ? " ;


//connection.query('UPDATE users SET Name = ? WHERE UserID = ?', [name, userId])

 db.get().query( sql , [ updateData.Status, updateData.Domain, updateData.Company],
   function(err,rows,fields) {
    if (err) {
      console.log(err);
       res.status(500).send('SQL Error')
    }

   
    res.json({message:"success"}); 
 });

});

app.post( '/api/deleteDomain' ,  function(req, res) {

var updateData  = req.body ; 
console.log(updateData); 

var sql = "DELETE FROM company_domain  WHERE Domain = ? AND Company = ? " ;


//connection.query('UPDATE users SET Name = ? WHERE UserID = ?', [name, userId])

 db.get().query( sql , [  updateData.Domain, updateData.Company],
   function(err,rows,fields) {
    if (err) {
      console.log(err);
       res.status(500).send('SQL Error')
    }

   
    res.json({message:"success"}); 
 });

});

app.get('/api/getDomainByCompany/:domain/:company' , function(req,res) {

  var company = req.params.company;
   var domain = req.params.domain;
   
  var sql = `SELECT * from company_domain WHERE Company = '${company}' AND Domain = '${domain}' `;
  db.get().query(sql , function( err,rows,fields) {
    if(err){
      console.log(err);
      res.status(500).send('SQL Error'); 
    }
    res.json(rows);
  });

})


app.get('/api/getDomainsByCompany/:company' , function(req,res) {

  var company = req.params.company;
  var sql = `SELECT * from company_domain WHERE Company = '${company}' ORDER BY EntryDate DESC `;
  db.get().query(sql , function( err,rows,fields) {
    if(err){
      console.log(err);
      res.status(500).send('SQL Error'); 
    }
    res.json(rows);
  });

})


app.post( '/api/updateCompanyDomainTags' ,  function(req, res) {

var updateData  = req.body.companyDomain ; 
console.log(updateData); 

var sql = "UPDATE company_domain SET Tags = ? WHERE CompanyDomainId = ? " ;
console.log(sql); 

 db.get().query( sql , [ JSON.stringify(updateData.Tags), updateData.CompanyDomainId],
   function(err,rows,fields) {
    if (err) {
      console.log(err);
       res.status(500).send('SQL Error')
    }

   
    res.json({message:"success"}); 
 });

});