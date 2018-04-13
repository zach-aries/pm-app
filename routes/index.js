var express = require('express');
var passport = require('passport');
var User = require('../models/user');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Home', user: req.user });
});

router.post('/register', function(req, res) {

    req.checkBody('username', 'Please enter a username').notEmpty();
    req.checkBody('password', 'Please enter a valid password').notEmpty();
    req.checkBody('cfm_pwd', 'Please confirm your password').notEmpty();
    req.checkBody('cfm_pwd', 'Password do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors)
        return res.send({valErrors : errors });

    User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.send({error : err.message });
        }

        passport.authenticate('local')(req, res, function () {
            return res.send({url : '/dashboard/projects'});
        });
    });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err)
            return next(err);

        if (!user)
            return res.send({error : info.message});

        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.send({url : '/dashboard/projects'}); // res.redirect('/dashboard/projects');
        });
    })(req, res, next);
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
        res.redirect('/');
    }
}


module.exports = router;
