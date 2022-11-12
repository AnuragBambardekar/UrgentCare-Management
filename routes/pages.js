const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth');
const db = require('../connection')

//These are to render the HTML pages

router.get('/',authController.isLoggedIn,(req, res) => {
    res.render('index', {
        user: req.user
    });
});

router.get('/register',(req, res) => {
    res.render('register');
});

router.get('/login',(req, res) => {
    res.render('login');
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
    console.log(req.message); //coming from middleware

    if( req.user ){
        res.render('profile', {
            user: req.user
        });
    }
    else{
        res.redirect('/login'); //if someone has no token to access /profile then redirect to /login
    }    
})

router.get('/viewDoctors', authController.isLoggedIn, (req, res) => {
    //res.render('doctors_list');
    /* db.query('SELECT * FROM users', (error, result) => {
        if(error){
            console.log(error);
        }
        console.log(result);
    }); */
    if( req.user ){
        res.render('doctors_list', {
            user: req.user
        });
    }
    else{
        res.render('doctors_list')
    }
    /* res.render('doctors_list', {
        user: req.user
    }); */
    //res.render('doctors_list')
});

module.exports = router;