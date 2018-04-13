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

exports.update_project = function(_id, name, description, cb) {
    Project.findOneAndUpdate({_id: _id}, {$set:{name:name, description: description}}, {new: true})
        .lean()
        .exec(function (err, project) {
            if (err) {
                cb(err, null);
                return;
            }

            cb(null, project);
        })
};

exports.remove_project = function (_id, cb) {
    Project.findOne({ _id:_id })
        .lean()
        .remove()
        .exec(function (err, project) {
            if (err) {
                console.log(err);
                cb(err, null);
                return
            }
            console.log('Removed Project:\n' + project);
            cb(null, project);
        });
};

exports.create_project_tree = function(features){
    var project = [];

    features.forEach(function (feature) {
        // create feature object
        /**
         must create custom object because cannot search for _id with 'find' method,
         also allows creation of children array in each object
         */

        var f = {
            name: feature.name,
            _id: String(feature._id),
            children: [],
            tasks: feature.tasks,
            est_start_date: feature.est_start_date,
            est_end_date: feature.est_end_date
        };
        // add root nodes
        if (feature.parent === null){
            // if no parent, then root node. Push to main array
            project.push(f);
            tree_helper(features, f);
        }
    });

    return project;
};

function tree_helper(data, parent) {
    data.forEach(function (obj) {
        if (obj.parent !== null){
            if (parent._id === String(obj.parent)){
                var feature = {
                    name: obj.name,
                    _id: String(obj._id),
                    parent: parent._id,
                    children: [],
                    tasks: obj.tasks,
                    est_start_date: obj.est_start_date,
                    est_end_date: obj.est_end_date
                };
                tree_helper(data, feature);

                parent.children.push(feature);
            }
        }
    });
}