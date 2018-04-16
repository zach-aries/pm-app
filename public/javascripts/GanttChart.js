// define module
let GanttChart = (function () {
    let module = {};
    let task_list = [];
    let first_date;
    let last_date;

    let process_data = function(data) {
        // for each feature, process the data and add tasks
        data.forEach(function (feature) {
           process_feature(feature);
        });
    };

    function get_edge_dates(start_date, end_date) {
        // get earliest date
        if (typeof first_date === 'undefined' || first_date === null || start_date < first_date) {
            // the variable is defined
            first_date = start_date;
        }

        // get latest date
        if (typeof last_date === 'undefined' || last_date === null || end_date > last_date) {
            // the variable is defined
            last_date = end_date;
        }
    }

    function milli_to_days(ms) {
        return Math.floor(ms / (24*60*60*1000));
    }

    /**
     * adds tasks from feature tree structure to task list
     * @param feature
     */
    function process_feature(feature) {
        let row = [];
        let start_date = new Date(feature.est_start_date);
        let end_date = new Date(feature.est_end_date);

        get_edge_dates(start_date, end_date);

        row.push(feature.name); // task name
        row.push(start_date);   // start date
        row.push(end_date);     // end date

        task_list.push(row); // add task to list

        feature.tasks.forEach(function (task) {
            let task_row = [];
            let start_date_t = new Date(task.est_start_date);
            let end_date_t = new Date(task.est_end_date);

            get_edge_dates(start_date_t, end_date_t);

            task_row.push(task.name);   // task name
            task_row.push(start_date_t);  // start date
            task_row.push(end_date_t);    // end date

            task_list.push(task_row); // add task to list
        });

        // for each sub feature of a feature, process and add tasks
        feature.children.forEach(function (child) {
            process_feature(child);
        });
    }

    let _drawGanttChart = function () {

        /*
        * Google Charts - TIMELINE CHART
        *   Reference: https://developers.google.com/chart/interactive/docs/gallery/timeline
        */
        let chart = new google.visualization.Timeline(document.getElementById('timeline'));
        let data = new google.visualization.DataTable();

        chart.clearChart();

        data.addColumn('string', 'Task Name');
        data.addColumn('date', 'Start');
        data.addColumn('date', 'End');

        data.addRows(task_list);

        let height = (42 * task_list.length) + 50;
        // find difference between first and last day, convert to days and multiply by 50 px
        let width = milli_to_days(last_date - first_date) * 50;

        if (width < $('#gantt').width())
            width = $('#gantt').width();

        let options = {
            height: height,    // TODO needs to be calculated
            //width: totaltime * 100,     // TODO needs to be calculated
            width: width,
            timeline: {
                trackHeight: 30,
                fontName: 'Garamond'
            }
        };

        $('#timeline').height(height + 3);
        $('#timeline-header').width(width);
        //$('#timeline-placeholder').w

        //chart.clearChart();
        chart.draw(data, options);
        module.hide_loader();
    };

    module.show_loader = function () {
        let loader = $('#gantt-loader');
        if( loader.hasClass('hidden') )
            loader.removeClass('hidden');
    };

    module.hide_loader = function () {
        setTimeout(function() {
            let loader = $('#gantt-loader');
            if( !loader.hasClass('hidden') )
                loader.addClass('hidden');
        }, 300);


    };

    module.init = function (data) {
        if (data.length > 0) {
            module.show_loader();

            if (!$('#timeline-placeholder').hasClass('hidden')) {
                $('#timeline-placeholder').addClass('hidden');
            }

            // create task list from tree
            task_list = [];
            process_data(data);

            google.charts.load('current', {'packages':['timeline']});
            google.charts.setOnLoadCallback(_drawGanttChart);
        } else {
            $('#timeline').empty();
            //let chart = app.getElementById('timeline');
            //chart.clearChart();

            $('#timeline-placeholder').removeClass('hidden');
            $('#timeline-header').removeAttr('style');
        }
    };

    return module;
})();