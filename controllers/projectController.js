var Project = require('../models/project');

exports.projectByID = function (id, cb) {
    Project.findOne({ _id:id})
        .exec(function (err, projects) {
            if (err) {
                cb(err,null);
                return;
            }
            //Successful, so return query
            cb(null, projects);
        });
};

exports.create_project = function (name, desc, owner, cb) {
    var project = new Project({
        name: name,
        description: desc,
        owner: owner
    });

    project.save(function (err) {
        if (err) {
            cb(err,null);
            return;
        }
        //console.log("New Project: " + project);
        cb(null, project);
    });
};