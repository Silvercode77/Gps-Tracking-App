console.log(process.cwd())
const http = require("http")
const express = require("express")
const mqtt = require("mqtt")

const { opendb, execute, fetchAll, fetchFirst } = require("./API/sql.js");
const { getRoute } = require('./API/calcRoute.js')
const { DBStart } = require("./API/initDB.js")
//const {SetupMqttClient}=require("./API/Mqtt.js")
const EventEmitter = require("events");
routeCalc = new EventEmitter();



const Stored = {
    db: null,
    mqttClient: null,
    back_res: {}
}

const protocol = 'mqtt'
const host = 'broker.emqx.io'
const port = '1883'

const Config = {
    MQTT: {
        connectUrl: `${protocol}://${host}:${port}`,

        Options: {
            clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
            clean: true,
            connectTimeout: 4000,
            username: 'sfe45646asd654asd',
            password: 'public',
            reconnectPeriod: 1000
        }
    },
    Server: {
        host: "192.168.100.11",
        port: 3000
    }
}


const SetupMqttClient = (async (client) => {

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

            Stored.back_res[topic] = JSON.parse(payload.toString())
            console.log("RECIEVED : ", topic, Stored.back_res[topic])
            routeCalc.emit("MqttDone", topic, Stored.back_res[topic]);

        } catch (error) {
            console.log("PARSING ERROR NO JSON FORMAT SENT", error)
        }
    })
});


routeCalc.on("MqttDone", async (topic, data) => {
    console.log("DATAAA", data)
    let sql = `SELECT STATIONS.GPS_LAT,STATIONS.GPS_LONG FROM BUS
    INNER JOIN STATIONS ON BUS.DEST=STATIONS.DEST WHERE BUS_ID=(?);`
    try {

        const tb = await fetchFirst(Stored.db, sql, data.bus_id);
        console.log("PRINTING TABLE")
        console.table(tb)
        const route = await getRoute([data.longitude, data.latitude], [tb.GPS_LONG, tb.GPS_LAT]);
        console.log("Start debfjg: ",route)
        if (route.distance <= 100) {
            routeCalc.emit(`arrived`, Stored.back_res[topic])
        }
        Stored.back_res[topic].route = route;
        console.log("FROMM HEERE", Stored.back_res[topic]);
        routeCalc.emit("dbParse", Stored.back_res[topic])
    }
    catch (err) {
        console.log(err);
    }
})

routeCalc.on("dbParse", async (data) => {
    try {
        const sql = `INSERT INTO BUS (BUS_ID, GPS_LAT, GPS_LONG,ROUTE,DISTANCE,ETA)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(BUS_ID) DO UPDATE SET 
    GPS_LAT = excluded.GPS_LAT,
    GPS_LONG = excluded.GPS_LONG,
    ROUTE=excluded.ROUTE,
    DISTANCE=excluded.DISTANCE,
    ETA=excluded.ETA
    ;`
        await execute(Stored.db, sql, [data.bus_id, data.latitude, data.longitude, JSON.stringify(data.route.coordonnes), data.route.distance, data.route.duration]);
        const row = await fetchAll(Stored.db, `SELECT * FROM BUS`);
        // console.table(row);
        console.log(JSON.parse(row[1].ROUTE))
    }
    catch (err) {
        console.log("there was an error parsing data in the db : ", err)
    }

})




routeCalc.on("arrived", async (data) => {
    try {
        const updateSQL = `
      UPDATE BUS
    SET DEST = (
    SELECT FIXTURES.DEST
    FROM FIXTURES
    WHERE FIXTURES.BUS_ID = (?)
    ORDER BY FIXTURES.rowid ASC
    LIMIT 1
        )
    WHERE BUS.BUS_ID=(?);
        `;

        const deleteSQL = `
     DELETE FROM FIXTURES 
    WHERE rowid IN (
    SELECT rowid FROM FIXTURES 
    WHERE FIXTURES.BUS_ID = (?)
    ORDER BY rowid ASC 
    LIMIT 1
        );`;

        await execute(Stored.db, updateSQL, [data.bus_id, data.bus_id]);
        await execute(Stored.db, deleteSQL, [data.bus_id]);
    } catch (err) {
        console.warn("Problem Continuing", err);
    }
});


app = express()

app.listen(Config.Server.port, Config.Server.host);

app.use(express.static("public"))

app.use(express.json());

app.get("/", (req, res) => {                            //sends in and renders the html page
    res.sendFile("./Map/map.html", { root: __dirname })
})

app.get("/rendb", async (req, res) => {
    let stations = await fetchAll(Stored.db, "SELECT * FROM STATIONS")
    res.json(stations);
}
)

app.get("/GPS", (req, res) => {     //sends in the last known data value retrieved from the mqtt topic 
    res.json(Stored.back_res)
})

app.get("/fixtures",async (req,res)=>{
    let sql=`SELECT * FROM FIXTURES ;`
    let fixRows=await fetchAll(Stored.db,sql);
    res.json(fixRows);
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Replace with your actual authentication logic
        const user = await fetchFirst(Stored.db, 
            'SELECT * FROM USER WHERE username = ? AND password = ?', 
            [username, password]);
        
        if (user) {
            res.status(200).send({ success: true });
        } else {
            res.status(401).send({ success: false });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send({ success: false });
    }
});


app.post("/stations", async (req, res) => {
    console.log(req.body)
    let sql = "SELECT BUS_ID FROM BUS WHERE DEST=? ORDER BY ETA ASC"
    let row = await fetchAll(Stored.db, sql, [req.body.DEST]);
    //console.log("POOSSTT",JSON.parse(row[0].ROUTE))
    console.log(row)
    res.json(row)

});



app.post('/update-fixtures', async (req, res) => {
    const changes = req.body;
    
    try {
        // Start transaction
        await execute(Stored.db, 'BEGIN TRANSACTION');
        
        // Clear existing fixtures (or implement your specific logic)
        await execute(Stored.db, 'DELETE FROM FIXTURES');
        
        // Insert new fixtures
        for (const change of changes) {
            if (change.busId && change.destination) { // Only insert valid rows
                await execute(Stored.db, 
                    'INSERT INTO FIXTURES (BUS_ID, DEST) VALUES (?, ?)',
                    [change.busId, change.destination]);
            }
        }
        
        await execute(Stored.db, 'COMMIT');
        res.status(200).send({ success: true });
    } catch (err) {
        await execute(Stored.db, 'ROLLBACK');
        console.error('Update error:', err);
        res.status(500).send({ success: false });
    }
});
const main = (async () => {

    Stored.db = await DBStart();
    await SetupMqttClient(Stored.mqttClient);

})();






/*app.post("/mouse", async (req, res) => {
    try {
        let sql = `SELECT GPS_LAT,GPS_LONG FROM STATIONS`
        row = await fetchFirst(Stored.db, sql);
        route = await getRoute([req.body.lng, req.body.lat], [row.GPS_LONG, row.GPS_LAT])
        res.send(route.coordonnes)
    }
    catch (err) {
        console.log("srry there war an error posting", err);
    }
})
*/