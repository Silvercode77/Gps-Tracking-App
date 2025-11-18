
const sqlite = require('sqlite3').verbose();
const { opendb, execute, fetchAll, fetchFirst } = require('./sql.js');

(async () => {
    try {
        db = await opendb("./test.db")
        //console.log(db);
    }
    catch (err) {
        console.log("there was an opening error with the db")
    }
    try {
        let cr_dest = `CREATE TABLE IF NOT EXISTS DESTINATIONS(
        DEST TEXT PRIMARY KEY,
        GPS_LAT REAL,
        GPS_LONG REAL
        );`
        await execute(db, cr_dest);
    }
    catch (err) {
        console.log("ERROR CREATING THE DEST TABLE", err);
    }

    try {
        let cr_bus = `CREATE TABLE IF NOT EXISTS BUS(
            BUS_ID INTEGER PRIMARY KEY ,
            DEST TEXT ,
            GPS_LAT REAL,
            GPS_LONG REAL,
            ETA REAL
            );`

        await execute(db, cr_bus);

    }
    catch (err) {
        console.log("there was an error creating db", err)
    }


    try {
        const rows = await fetchAll(db, "SELECT * FROM BUS")
        console.log("SECOND STEP")
        console.table(rows)
    }
    catch (err) {
        console.log("there was an error selecting db", err)
    }
})();
