const mysql = require("mysql");
//Configure Database connection
const db = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB
});

//Connect to Database
db.connect((err) => {
    if(err){
        console.log(error)
    }
    else{
        console.log("Connected to Database!")
    }
});

module.exports = db;