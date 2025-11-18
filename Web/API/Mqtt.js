
const SetupMqttClient =async (client) => {

    client = mqtt.connect(Config.MQTT.connectUrl, Config.MQTT.Options)

    client.on('connect', () => {
        console.log('Connected')
        client.subscribe("GPS/+", (err, granted) => {              //subcribe on event NEED TO BE ADDED
            if (!err) {
                console.log("Subscribed To : ", granted)
            }
        })
    })

    client.on('error', (err) => {
        console.error('MQTT Error:', err);
    });
    client.on('offline', () => {
        console.warn('MQTT client is offline');
    });
    client.on('reconnect', () => {
        console.warn('Reconnecting to MQTT broker...');
    });
    
client.on("message", async (topic, payload) => {                  //retrieves the data from the mqtt broker and appends the data object          
    try {

        back_res[topic] = JSON.parse(payload.toString())
        console.log("RECIEVED : ", topic, back_res[topic])
        route_calc.emit("mqtt_done", topic, back_res[topic]);

    } catch (error) {
        console.log("PARSING ERROR NO JSON FORMAT SENT", error)
    }
})
}



module.exports={SetupMqttClient}



