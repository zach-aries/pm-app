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

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err)
            return next(err);

        if (!user)
            return res.render('pages/login', { title: 'Login', error : info.message });

        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/dashboard/projects');
        });
    })(req, res, next);
});

    //});

    //res.redirect('/login');

    //const err_message = 'Username or password does not exist';
    //res.render('pages/login', { title: 'Login', error : err_message });
//});

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
