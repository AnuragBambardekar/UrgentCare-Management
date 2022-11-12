//Start nodejs server and import libraries
const express = require("express"); 
const mysql = require("mysql");
const dotenv = require("dotenv").config({path: './.env'});
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./connection')

/* //Configure Database connection
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
}); */

//set view engine
app.set('view engine', 'hbs');

//location of css,js,images for frontend
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({extended: false})); //Parse URL encoded bodies (as sent by HTML forms)
app.use(express.json()); //Parse JSON bodies (as sent by API clients)
app.use(cookieParser()); //use cookie parser

//Define Routes
app.use('/', require('./routes/pages')); //all routes beginning with / are in pages.js
app.use('/auth', require('./routes/auth')); //all routes beginning with /auth are in auth.js

//Connect to Server Port
let port = process.env.APP_PORT || 5000;
app.listen(port,() => {
    console.log("Server started on Port :", port);
});