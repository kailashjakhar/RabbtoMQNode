var mysql = require('mysql');

const HOST_NAME = ""
const USER_NAME = ""
const USER_PASSWORD = ""
const DATABASE = ""

  function getBusData(resolve,reject) {
      try {
        var con = mysql.createConnection({
            host: HOST_NAME,
            user: USER_NAME,
            password: USER_PASSWORD,
            database: DATABASE
          });

          con.connect(function(err) {
            if (err) throw err;
            
            console.log("Connected! to DB...");
            
            con.query("call spGPSGet_BusData", function (err, result, fields) {
                if (err) throw err;
                console.log("QUERY EXECUTED");
                resolve(result);
              });
              con.end();
          });

        
      } catch (error) {
        console.log("ERROR :: ",error);
        reject(error);
      }
  }

  module.exports.getBusData = getBusData;