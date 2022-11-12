const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {promisify} = require("util");
const db = require('../connection')

/* const db = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB
}); */

exports.register = (req,res) => {
    console.log(req.body); //grabbing data from body and logging it
    
    const { name, email, password, passwordConfirm} = req.body;

    //Validate fields [Server-side validation]
    if( !name || !email || !password || !passwordConfirm){
        return res.render('register', {
            message: 'Please fill all the fields in order to register!',
            name,
            email //send form data back
        })
    }
    //can also add password criteria later
    else{
        db.query('SELECT email FROM users WHERE email = ?', [email], async(error, results) => {
            if(error){
                console.log(error);
            }
            if(results.length > 0){
                return res.render('register', {
                    message: 'Email already exists!',
                    name,
                    email
                })
            }else if(password !== passwordConfirm){
                return res.render('register', {
                    message: 'Passwords Do Not Match!',
                    name,
                    email
                });
            }

            let hashedPassword = await bcrypt.hash(password, 8);
            console.log(hashedPassword);

            db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
                if(error){
                    console.log(error);
                }else {
                    console.log(results);
                    return res.render('register', {
                        message: 'User Registered'
                    })
                }
            })
        });
    }
}

exports.login = async (req, res) => {
    //we use async to make sure that some actions might take
    //a little time to do
    //so make sure that server waits for them to occur

    try{
        const {email, password} = req.body;

        if( !email || !password) {
            return res.status(400).render('login', {
                message: 'Please enter an email and password!'
            })
        }

        //? - positional parameters to avoid SQL injection attacks
        db.query('SELECT * FROM users WHERE email = ?', [email], async(error, results) => {
            console.log(results);
            
            if( !results || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('login', {
                    message: 'Email or Password is Incorrect!'
                })
            }
            else{
                const id = results[0].id; //grab user id from DB

                //create unique token for user
                const token = jwt.sign({ id: id}, process.env.JWT_SECRET, {
                    //when does it expire?
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("Token is: ",token)

                //create cookie
                const cookieOptions = {
                    expiresIn: new Date(
                        //convert to milliseconds
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                //put cookie in browser
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/profile");
            }
        }) 

    }catch(error){
        console.log(error);
    }
}

exports.isLoggedIn = async(req, res, next) => {
    req.message = "Inside Middleware";

    console.log(req.cookies); //checking if any cookies on the browser
    if( req.cookies.jwt) {
        try{
            //1) verify the token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET);//to grab id of user
            console.log(decoded);

            //2) check if user still exists
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result);

                if( !result ){
                    return next();
                }
                req.user = result[0];
                return next();
            })

        }catch(error){
            console.log(error);
            return next();
        }
    }
    else{
        next(); 
        //we go to render the page so,
        //'/profile',auth.isLoggedIn, (req,res) <-- from pages.js
    }  
}

exports.logout = async(req,res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2*1000), //cookie removed after two seconds you press logout
        httpOnly: true
    });//overwrite current cookie

    res.status(200).redirect('/');
}

exports.viewDocs = (req,res,next) => {
    //console.log(req.body);
    //res.send("form submitted")
    const { user } = req.body; //Get Data from HTML form like name, search filters and use it in SQL query
    console.log("user exist?",user)

    db.query('SELECT * FROM users', (error, result) => {
        if(error){
            console.log(error);
        }
        console.log(result);
        return res.status(200).render('doctors_list', {
            message: 'Submitted!',
            results: result,
            user: user
        })
    });
    
    
}