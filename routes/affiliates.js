var express = require('express'),
    db      = require('../db');
var app = module.exports = express.Router();
//var jwtDecode = require('jwt-decode'); 


app.post( '/api/updateMechanisms' ,  function(req, res) {
  console.log(req.body); 
var updateData  = req.body ; 
var sql = "UPDATE company_domain SET Mechanisms = ? WHERE Domain = ? AND Company = ? " ;
console.log(sql); 
 db.get().query( sql , [ JSON.stringify(updateData.Mechanisms), updateData.Domain, updateData.Company],
   function(err,rows,fields) {

    if (err) {
      console.log(err);
       res.status(500).send('SQL Error')
    }

    res.json({message:"success"}); 
 });

});



app.get('/api/getAffiliatesByCompany/:company' , function(req,res) {

  var company = req.params.company;
  var sql = `SELECT * from company_domain WHERE Company = '${company}' AND Status = 'Influencer' `;
  db.get().query(sql , function( err,rows,fields) {
    if(err){
      console.log(err);
      res.status(500).send('SQL Error'); 
    }
    res.json(rows);
  });

})
