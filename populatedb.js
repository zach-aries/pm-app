#! /usr/bin/env node

console.log('This script populates some test tasks, features and projects to the database specified. Specified database as var mongoDB = \'mongodb://your_username:your_password@your_dabase_url\'');

var async = require('async');
var Task = require('./models/task');
var Feature = require('./models/feature');
var Project = require('./models/project');

dropCollections([Task,Feature,Project]);

/*Task.collection.drop();
Feature.collection.drop();
Project.collection.drop();*/


var mongoose = require('mongoose');
var mongoDB = 'mongodb://group8:seng513@seng513-shard-00-00-zscro.mongodb.net:27017,seng513-shard-00-01-zscro.mongodb.net:27017,seng513-shard-00-02-zscro.mongodb.net:27017/test?ssl=true&replicaSet=seng513-shard-0&authSource=admin';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var tasks = [];
var features = [];
var projects = [];

function dropCollections(collections) {
    for (var i = 0; i < collections.length; i++) {
        collections[i].collection.drop();
    }
}

function taskCreate(name, desc, est_start_date, est_end_date, status, cb) {
    var task = new Task({
        name: name,
        description: desc,
        est_start_date: est_start_date,
        est_end_date: est_end_date,
        status: status
    });

    task.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Task: ' + task);
        tasks.push(task);
        cb(null, task);
    });
}

function featureCreate(name, tasks, cb) {
    var feature = new Feature({
        name: name,
        tasks: tasks
    });

    feature.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Feature: ' + feature);
        features.push(feature);
        cb(null, feature);
    });
}

function projectCreate(name, features, cb) {
    var project = new Project({
        name: name,
        features: features
    });

    project.save(function (err) {
        if (err) {
            cb(err,null);
            return;
        }
        console.log("New Project: " + project);
        projects.push(project);
        cb(null, project);
    })
}

function createTasks(cb) {
    async.parallel([
        function(callback) {
            taskCreate('Task Pending', 'This is a pending task.', '2018-06-06', '2018-06-21', 'Pending', callback);
        },
        function(callback) {
            taskCreate('Task Started', 'This is a started task.', '2018-08-06', '2018-08-21', 'Started', callback);
        },
        function(callback) {
            taskCreate('Task Complete', 'This is a complete task.', '2018-08-06', '2018-08-21', 'Complete', callback);
        },
        function(callback) {
            taskCreate('Task Overdue', 'This is an overdue task.', '2018-08-06', '2018-08-21', 'Overdue', callback);
        }
    ], cb);

}

function createFeatures(cb) {
    async.parallel([
        function (callback) {
            featureCreate('Feature 1', [tasks[0], tasks[1]], callback);
        },
        function (callback) {
            featureCreate('Feature 2', null, callback);
        },
        function (callback) {
            featureCreate('Feature 3', null, callback);
        }
    ], cb);
}

function createProjects(cb) {
    async.parallel([
        function (callback) {
            projectCreate('Project 1', [features[0]], callback);
        }
    ], cb);
}

async.series([
    createTasks,
    createFeatures,
    createProjects
],

// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Projects: ' + projects);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




