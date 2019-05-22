var express = require('express'),
      _  = require('lodash'),
  
   jwt     = require('jsonwebtoken')
   db      = require('../db');
   var app = module.exports = express.Router();
   var jwtSecret = require('./../config.json').secretKey;
   var crypto = require('crypto');
   var bcrypt = require('bcryptjs'); 

function getUserDB(username, done) {
  //console.log("get user db");
  db.get().query('SELECT * FROM user WHERE Email = ? LIMIT 1', [username], function(err, rows, fields) {
    if (err) throw err;
    done(rows[0]);
  });
}

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), /*config.secretKey*/ jwtSecret, { expiresIn: 60*60* 24  });
}

app.post('/api/user/login', function(req, res) {
  //console.log(req) ;

  if (!req.body.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }
  getUserDB(req.body.username, function(user){
    console.log(req.body); 
    if (!user) {
      console.log("user doesn't exist");
      return res.status(401).send("The username does not exist");
    }
    
  //  if ( bcrypt.compareSync( req.body.password, user.Password ) === false ) {
    if (user.Password !== req.body.password) {
    return res.status(401).send("The username or password don't match");
  }
  res.status(200).send({
    id_token: createToken(user),
    user:user
  });
  console.log(user); 
    //trackLogin(ipAddress, email, 'test' ) ;
  });
});



app.get('/api/user/verify/', function(req, res) {
 /* if (!req.params.token) {
    return res.status(400).send("No Token");
  } */

  var token = req.headers.auth ;


  jwt.verify(token, jwtSecret, function (err, decoded){

    if (err){
      console.log(err);
               // req.authenticated = false;
              //  req.decoded = null;
              //  next();
              return res.status(401).send("Invalid Token") ;

            } else {

               // req.decoded = decoded;
               // req.authenticated = true;

               return  res.status(200).send() ;

                //next();
              }
            });

});
