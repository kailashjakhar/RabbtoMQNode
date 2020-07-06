var amqp = require('amqplib/callback_api');
const { getBusData } = require("./db");
const { exit } = require("process");

var dataResolver = new Promise((resolve,reject)=>{
    getBusData(resolve,reject);
}            
);

dataResolver.then(response=>{
    let data = []
    let rawData = response[0];
    if(rawData.length > 0) {
        rawData.forEach(item => {
            if(item.mGPSVenderID == 1) {
                data.push(getDataForEnqueue(item));                
            }
        });
    }
    insertDataInQueqe(data);
    // console.log(data);

}).catch(error=>{
    console.log(error);
})

 getDataForEnqueue = (data) => {
    
    let dataForQueue = {
        BusMasterID:data.BusMasterID,
        BusMasterNumber:data.BusMasterNumber,
        GPSVendorName:data.mGPSVenderID,
        GPSVehicleID:data.mGPSVehicleID,
        GPSAuthCode:data.mGPSAuthCode,
        GPSAPIKey:data.GPS_API_Key,
        LastProcessedTime: new Date().getTime(),
        LastLatitude:"",
        LastLogitude:""
    };
    return dataForQueue;
}



 insertDataInQueqe =(data) =>{
    let queueName = "testkailash";
    amqp.connect("amqp://localhost",(error,connection)=>{
    if(error) {
        throw error;
    } else {
        connection.createChannel((error,channel)=>{
            if(error) {
                throw error;
            } else {
            
                channel.assertQueue(queueName,{
                    durable : true
                })
                data.forEach(item => {
                    // let item = data[0];
                    channel.sendToQueue(queueName,Buffer.from(JSON.stringify(item)));
                    console.log(" [x] Sent %s", JSON.stringify(item)); 
                });                
                setTimeout(function() {
                    connection.close();
                    process.exit(0);
                }, 500);
            }
        });
    }    
});

}



// var myArgs = process.argv.slice(2);
// var queueName = myArgs[0]
// var message = {name:"kailash",timeS:new Date()};//JSON.stringify(myArgs.slice(1).join(" "));
// // console.log(message);
// message = JSON.stringify(message);

