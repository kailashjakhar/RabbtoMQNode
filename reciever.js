var querystring = require('querystring');
var http = require('http');
var amqp = require('amqplib/callback_api');
var axios = require('axios');

// var myArgs = process.argv.slice(2);
var queueName = "testkailash";

main = () => {
    amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        channel.assertQueue(queueName, {
            durable: true
        });


        channel.consume(queueName, function(message) {
            console.log(" [x] Received %s", message.content.toString());
            process(message,channel);        
        }, {
            noAck: false
        });
    });
});

}
 process = (message,channel) => {
     let data = JSON.parse(message.content.toString());
     channel.ack(message);
    // console.log(data);
    try {
        performRequest(data.GPSVehicleID,(response)=>{
            // console.log(response);
            if(typeof response === "string" && response.indexOf("not found") === -1) {
                // console.log(data.GPSVehicleID,"ERROR : ",response);
                let dataToSave ={
                    BusID: data.BusMasterID,
                    Latitude: "0.0",
                    Longitude: "0.0",
                    Status: "FAILED",
                    Message: "HARDCODED VALUE",
                    ErrCode: "NO ERRPR",
                    GPSCapturedDateTime: new Date().getTime(),
                    EntryDateTime : "12-12-2020",
                    VID:"4"
                }
                putDataToES(dataToSave,(res)=>{
                    console.log("ELASTIC RES ===",res);                
                });
                } 
        })
        
    } catch (error) {
        // console.log("EXCEPTION : ",error);
    }
    // channel.ack(message);
        
}


putDataToES = (data,callback) => {
    let indexName = "testkailash";
    let indexMapping = "geodata";
    let es_data ="";
    es_data += '\n{"index" : {"_index":"' + indexName  + '", "_type":"' +  indexMapping + '"}}\n'
    es_data += JSON.stringify(data);
    es_data += "\n"

  var  headers = {'content-type': 'application/json'}
    var req = http.request(
        {
            host: "18.139.225.177",
            path: "/_bulk",
            method: "POST",
            headers: headers,
            port:9200
          }, function(res) {
        res.setEncoding('utf-8');
    
        var responseString = '';
    
        res.on('data', function(data) {
          responseString += data;
        });
    
        res.on('end', function() {
            callback(responseString);
        });
      });
    
      req.write(es_data);
      req.end();
    
}

 performRequest = (venderID,callback) => {
  var dataString = JSON.stringify({});
  var headers = {};
  
  var options = {
    host: "45.114.246.58",
    path: "/gpstracking/get_vehicle_location.php?vehicle_id="+venderID,
    method: "GET",
    headers: headers
  };
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
        callback(responseString);
    });
  });

  req.write(dataString);
  req.end();
}



main();