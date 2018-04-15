// define module
var GanttChart = (function () {
    var module = {};
    var task_list = [];

    var process_data = function(data) {
        // for each feature, process the data and add tasks
        data.forEach(function (feature) {
           process_feature(feature);
        });
    };

    /**
     * adds tasks from feature tree structure to task list
     * @param feature
     */
    function process_feature(feature) {
        var row = [];
        var start_date = new Date(feature.est_start_date);
        var end_date = new Date(feature.est_end_date);

        row.push(feature._id);  // task id
        row.push(feature.name); // task name
        row.push(feature._id);  // resource ID (used for grouping)
        row.push(start_date);   // start date
        row.push(end_date);     // end date
        row.push(null);         // duration (automatically calculated)
        row.push(50);           // completion %
        row.push(null);         // dependencies (null for none)

        task_list.push(row); // add task to list

        feature.tasks.forEach(function (task) {
            var task_row = [];
            var start_date = new Date(task.est_start_date);
            var end_date = new Date(task.est_end_date);

            task_row.push(task._id);    // task id
            task_row.push(task.name);   // task name
            task_row.push(task.feature);    // resource ID (used for grouping)
            task_row.push(start_date);  // start date
            task_row.push(end_date);    // end date
            task_row.push(null);        // duration (automatically calculated)
            task_row.push(50);          // completion %
            task_row.push(null);        // dependencies (null for none)

            task_list.push(task_row); // add task to list
        });

        // for each sub feature of a feature, process and add tasks
        feature.children.forEach(function (child) {
            process_feature(child);
        });
    }

    var _drawGanttChart = function () {
        /*
        var chart = new google.visualization.Gantt(document.getElementById('timeline'));

        var data = new google.visualization.DataTable();

        // the columns when pushing to the row array
        data.addColumn('string', 'Task ID');
        data.addColumn('string', 'Task Name');
        data.addColumn('string', 'Resource');
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration');
        data.addColumn('number', 'Percent Complete');
        data.addColumn('string', 'Dependencies');

        data.addRows(task_list);

        var options = {
            height: 400, // TODO needs to be calculated
            width:1000, // TODO needs to be calculated
            gantt: {
                trackHeight: 30
            }
        };



        chart.clearChart();
        chart.draw(data, options);
        */

        /*
        * TIMELINE CHART
        *
        */
        var chart = new google.visualization.Timeline(document.getElementById('timeline'));
        var data = new google.visualization.DataTable();

        data.addColumn({ type: 'string', id: 'Task ID' });
        data.addColumn({ type: 'string', id: 'Task Name' });
        data.addColumn({ type: 'date', id: 'Start' });
        data.addColumn({ type: 'date', id: 'End' });

        dataTable.addRows(task_list);

        var options = {
            height: 400,    // TODO needs to be calculated
            width:1000,     // TODO needs to be calculated
            timeline: {
                trackHeight: 30
            }
        };

        chart.clearChart();
        chart.draw(dataTable, options);





    };

    module.init = function (data) {
        // create task list from tree
        process_data(data);

        google.charts.load('current', {'packages':['gantt']});
        google.charts.setOnLoadCallback(_drawGanttChart);
    };

    return module;
})();