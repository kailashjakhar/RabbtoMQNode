var amqp = require('amqplib/callback_api');


var myArgs = process.argv.slice(2);
var queueName = myArgs[0]
var message = {name:"kailash",timeS:new Date()};//JSON.stringify(myArgs.slice(1).join(" "));
// console.log(message);
message = JSON.stringify(message);
amqp.connect("amqp://localhost",(error,connection)=>{
    if(error) {
        throw error;
    } else {
        connection.createChannel((error,channel)=>{
            if(error) {
                throw error;
            } else {
            
                channel.assertQueue(queueName,{
                    durable : false
                })

                channel.sendToQueue(queueName,Buffer.from(message));
                console.log(" [x] Sent %s", message);
            }
        });
    }
    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});