
const { opendb, execute, fetchAll, fetchFirst } = require('./sql.js');
let db = {};
const DBStart = (async () => {
    try {
        const TABLES = [
            `CREATE TABLE IF NOT EXISTS BUS(
        bus_id INTEGER PRIMARY KEY ,
        DEST TEXT,
        GPS_LAT REAL,
        GPS_LONG REAL,
        ROUTE REAL,
        DISTANCE REAL,
        ETA REAL
         );`,

            `CREATE TABLE IF NOT EXISTS STATIONS(
        DEST TEXT PRIMARY KEY,
        GPS_LAT REAL,
        GPS_LONG REAL
        );`,

            `CREATE TABLE IF NOT EXISTS FIXTURES(
        BUS_ID INTEGER,
        DEST TEXT
        );`
        ]

        db = await opendb("./test.db")
        for (const TABLE of TABLES) {
            await execute(db, TABLE)
        }
    }
    catch (err) {
        console.log("There has been an Error with DBStart", err);
    }
    return db;
});



module.exports = {
    DBStart
}