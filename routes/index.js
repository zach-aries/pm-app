var express = require('express');
var passport = require('passport');
var User = require('../models/user');

var router = express.Router();

// Middleware to require login/auth
const requireLogin = passport.authenticate('local');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Home', user: req.user });
});

router.get('/register', function(req, res) {
    res.render('pages/register', { title: 'Register'} );
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('pages/register', { title: 'Register', error : err.message });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/dashboard/'+req.user.username + '/projects');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('pages/login', { title: 'Login', user : req.user });
});

router.post('/login',  passport.authenticate('local'), function(req, res) {
    res.redirect('/dashboard/'+req.user.username + '/projects');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.use('/dashboard', loggedIn, function(req, res, next) {
    next();
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


module.exports = router;
