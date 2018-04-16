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

        row.push(feature.name); // task name
        row.push(start_date);   // start date
        row.push(end_date);     // end date

        task_list.push(row); // add task to list

        feature.tasks.forEach(function (task) {
            var task_row = [];
            var start_date = new Date(task.est_start_date);
            var end_date = new Date(task.est_end_date);

            task_row.push(task.name);   // task name
            task_row.push(start_date);  // start date
            task_row.push(end_date);    // end date

            task_list.push(task_row); // add task to list
        });

        // for each sub feature of a feature, process and add tasks
        feature.children.forEach(function (child) {
            process_feature(child);
        });
    }

    var _drawGanttChart = function () {

        /*
        * Google Charts - TIMELINE CHART
        *   Reference: https://developers.google.com/chart/interactive/docs/gallery/timeline
        */
        var chart = new google.visualization.Timeline(document.getElementById('timeline'));
        var data = new google.visualization.DataTable();

        chart.clearChart();

        data.addColumn('string', 'Task Name');
        data.addColumn('date', 'Start');
        data.addColumn('date', 'End');

        data.addRows(task_list);

        console.log(task_list.length);
        var options = {
            //height: (41 * task_list.length) + 50,    // TODO needs to be calculated
            //width: totaltime * 100,     // TODO needs to be calculated
            //width: (40 * task_list.length) + 500,
            timeline: {
                trackHeight: 30,
                fontName: 'Garamond'
            }
        };

        //chart.clearChart();
        chart.draw(data, options);
    };

    module.init = function (data) {
        // create task list from tree
        process_data(data);

        google.charts.load('current', {'packages':['timeline'], "callback": _drawGanttChart});
        google.charts.setOnLoadCallback(_drawGanttChart);
    };

    return module;
})();