const sqlite = require('sqlite3').verbose();

const opendb = (filename) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database(filename, sqlite.OPEN_READWRITE, (err) => {
      if (err) {
        console.error("DB connection error:", err.message);
        reject(err);
      } else {
        console.log("Connected to DB.");
        resolve(db);
      }
    });
  });
};


const execute = async (db, sql, param = []) => {
  if (param && param.length > 0) {
    return new Promise((resolve, reject) => {
      db.run(sql, param, (err) => {
        if (err) {
          reject(err);
          console.error("Problem inserting:", err);
        }
        resolve();
      })
    }
    )
  }

  else {
    return new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          console.error("Problem creating:", err)
          reject(err);
        }
        resolve();
      })
    })
  }
}



const fetchAll = async (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

const fetchFirst = async (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};


module.exports = {
  execute,
  opendb,
  fetchAll,
  fetchFirst
};


/*(async ()=>{
  
   const db= await opendb("./test.db")
   console.log(db);
   //const dr=`DROP TABLE first200`
  // await execute(db,dr);
    const sql = `CREATE TABLE IF NOT EXISTS first200 (
        bus_id INTEGER PRIMARY KEY,
        gps_data TEXT
    )`
   
    await execute(db, sql);
console.log("FIRST STEP")
const sqlInsert = `INSERT INTO first200 (bus_id,gps_data) VALUES (?,?),(?,?)`;
await execute(db, sqlInsert, [1000,"200",1001,"200"]); 


/*const sql5 = `INSERT INTO first200 (bus_id , gps_data) VALUES (?, ?)`
await execute(db, sql5, [(50, "12")]);*/






/*const res =await fetchAll(db,"SELECT * FROM first200")


 


console.log("SECOND STEP")
console.table(res)

    
})();

/*(async()=>{
const db= await opendb("./test.db")
    console.log(db);
})*/