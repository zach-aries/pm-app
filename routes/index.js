var express = require('express');
var passport = require('passport');
var User = require('../models/user');

var router = express.Router();

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
            res.redirect('/dashboard/projects');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('pages/login', { title: 'Login', user : req.user });
});

router.post('/login',  passport.authenticate('local'), function(req, res) {
    res.redirect('/dashboard/projects');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.use('/dashboard', is_logged_in, function(req, res, next) {
    next();
});

function is_logged_in(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


module.exports = router;
