var Project = require('../models/project')

exports.project_list = function (id, cb) {

    console.log(id);

    Project.find({ users:id}, '_id name description')
        .exec(function (err, projects) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, projects);
        });
};

exports.create_project = function (name, desc, features, users, cb) {
    var project = new Project({
        name: name,
        description: desc,
        features: features,
        users: users
    });

    project.save(function (err) {
        if (err) {
            cb(err,null);
            return;
        }
        console.log("New Project: " + project);
        cb(null, project);
    });
};