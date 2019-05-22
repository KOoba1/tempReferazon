var mysql = require('mysql');
var pool  = null;
var util = require('util'); 

exports.connect = function() {
  console.log('connecting');
  pool = mysql.createPool({
   host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : 'referazon',
    debug:false
  });

  pool.query = util.promisify(pool.query); 
}

exports.get = function() {
  return pool;
}

