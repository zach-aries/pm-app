var whichUpdateFeat = -1;
var whichUpdateTask = -1;

$(function () {
    /*

    function drawChart() {


    }*/


    const socket = io();

    var initiated = false;
    var userID = $('#user-info').attr('data-userID');
    var projectID = $('#project-directory').attr('data-projectID');

    /*===========================================
                    Send Events
    ===========================================*/
    socket.on('connect', function() {
        // connect function
        socket.emit('user connected', projectID, userID);
    });
    

    /**
     * Messenger form submit, parses message and
     * sends to server.
     */
    $('#chat-input').submit(function(){
        const msg = $('#msg').val();

        // check to make sure the message includes a character
        if (msg.match(/\S/)) {
            // emit message to server and add li with msg to chat box
            socket.emit('message', userID, projectID, msg);

            // clear chat entry
            $('#msg').val('');
        }

        return false;
    });

    /**
     * Feature form submit
     */
    $('#newFeatureForm').submit(function(){
        var parentID = $('#newFeatureParent').val();
        const name = $('#newFeatureName').val();

        console.log("featureParent: "+parentID);
        console.log("featureName: " + name);

        // Dates
        const fromDate = $('#datepickerFeatureS').val();  //.data("datepicker").getFormattedDate('yyyy-mm-dd');
        const toDate = $('#datepickerFeatureF').val(); //.data("datepicker").getFormattedDate('yyyy-mm-dd');

        console.log("StartDate: " + fromDate);
        console.log("EndDate: " + toDate);
        
        if (name.length < 1) {
            var newAlertMsg = "Must provide a name for new feature";
            $('#added-alert').modal('toggle');
            $('#alert-msg').html(newAlertMsg);
        }
        // Check that end date isn't before start date
        else if (toDate < fromDate) {
            var newAlertMsg = "Start date must be before end date";
            $('#added-alert').modal('toggle');
            $('#alert-msg').html(newAlertMsg);
        }
        else if (toDate == "" || fromDate == "") {
            var newAlertMsg = "You must enter both a start and end date";
            $('#added-alert').modal('toggle');
            $('#alert-msg').html(newAlertMsg);
        }
        else {
            console.log("feature parent: " + parentID);

            // If no parent specified, send null
            if (parentID.trim() === "(None)") {
                console.log("Yay! NONE!");
                parentID = null;
            }
        
            // Clear name field
            document.getElementById("newFeatureName").value = "";        

            socket.emit('add feature', name, projectID, parentID, fromDate, toDate);

            $('#newFeatureModal').modal('toggle');

            // Make dates 

            //var newAlertMsg = "Feature \"" + name + "\" added.";
            //$('#added-alert').modal('toggle');
            //$('#alert-msg').html(newAlertMsg);

            //alert("Feature Added!");
        }
        return false;
    });

    $('#add-users').click(function () {
        const user = $('#projectSettingsAddUser').val();

        // check to make sure the username includes a character
        if (user.match(/\S/)) {
            socket.emit('add user', user, projectID);

            // clear chat entry
            $('#projectSettingsAddUser').val('');
        }
    });

    $('#add-task').click(function () {
        const taskName = $('#taskName').val();
        const description = $('#description').val();
        const featureID = $('#featureIDForTask').val();
        // const assignedTo = $('#assignedTo').val;
        const assignedTo = 1;
        const est_start_date = $('#datepickerTaskS').val();
        const est_end_date = $('#datepickerTaskF').val();

        var allGood = 1;
        const status = "Pending";

        if (taskName.length < 1) {
            var newAlertMsg = "Task name cannot be empty";
            $('#added-alert').modal('toggle');
            $('#alert-msg').html(newAlertMsg);
            allGood = 0;
        }
        else if(description.length < 1){
            var newAlertMsg = "Description cannot be empty";
            $('#added-alert').modal('toggle');
            $('#alert-msg').html(newAlertMsg);
            
            allGood = 0;
        }
        else if (est_end_date < est_start_date) {
            var newAlertMsg = "To date cannot be less than From date";
            $('#added-alert').modal('toggle');
            $('#alert-msg').html(newAlertMsg);
            allGood = 0;
        } else if (est_end_date == est_start_date) {
            var newAlertMsg = "To date cannot be the same as From date";
            $('#added-alert').modal('toggle');
            $('#alert-msg').html(newAlertMsg);
            allGood = 0;
        }

        if (Boolean(allGood)) {
            socket.emit('add task', taskName, description, featureID, est_start_date, est_end_date, status);
            $('#newTaskModal').modal('toggle');
            //alert("Task added!");
        }
    });

    // Read task from project menu
    $('#project-directory').on('click', 'a.task', function() {
        const taskID = $(this).attr('id');
        whichUpdateTask = 1;
        socket.emit('get task', taskID, projectID);
        $('#readTaskModal').modal('toggle');
    });

    // TODO remove the following and replace with correct calls
    $('#project-directory').on('click', 'a.feature', function() {
        const featureID = $(this).attr('id');
        whichUpdateFeat = 1;
        socket.emit('get feature', featureID, projectID);
        //const featureName = $(this).val();
        //socket.emit('remove feature', featureID);
        //let feature = get_feature(featureID);
        

        $('#readFeatureModal').modal('toggle');
        $('.store-id').attr("id", featureID);
    });
    
    //delete feature from feature section
    $('#delete-featureBtn').click(function() {
        const featureID = $('.store-id').attr('id');
        socket.emit('remove feature', projectID, featureID);
    });

    //delete task from feature section
    $('#delete-taskBtn').on('click', 'a.task', function() {
        const taskID = $(this).attr('id');
        socket.emit('remove task', projectID, taskID);
    });

    //delete task from todo section
    $('#delete-button-todo').on('click', 'a.task', function() {
        const taskID = $(this).attr('id');
        socket.emit('remove task', projectID, taskID);
    });

    //change status of a pending task into in process
    $('#start-task').on('click', 'a.task', function() {
        const taskID = $(this).attr('id');
        const status = "Started";
        socket.emit('update status', taskID, status);
        $('#')
    });

    //change status of a pending task into in process
    $('#complete-task').on('click', 'a.task', function() {
        const taskID = $(this).attr('id');
        const status = "Complete";
        socket.emit('update status', taskID, status);
        $('#')
    });

    /*===========================================
                    Catch Events
     ===========================================*/
    socket.on('init', function (data) {
        // prevent double initiate on lost connection
        // there is probably a better solution?
        if (!initiated) {
            init(data);
            initiated = true;
        }
    });

    socket.on('userlist update', function (userList) {
       // console.log('user connected:', userList);
        var temp = '';
        for(i=0;i<userList.length;i++) {
            temp = temp + '<li class="online">' + userList[i];
        }
        $('#user-list').html(temp);
        console.log('current user list: ', temp);
    });




    socket.on('message', function (message) {
        // add message to DOM
        addMessage(message);
    });

    socket.on('add feature', function (feature) {
        // create parent var for later
        var parentEl;
        if (feature.parent !== null) {
            // if feature has a parent, then add it as a sub feature
            // get feature-list to add feature to
            parentEl = $('#'+feature.parent).parent().children('.feature-list:first');

            // if feature-list doesnt exist, create a new one and add it to the features parent el
            if (!parentEl.length) {
                var ul = $('<ul>').addClass('hierarchy-list feature-list');
                $('#'+feature.parent).parent().append(ul);
                parentEl = ul;
            }
        } else {
            // if feature doesnt have a parent, add it to the main directory el
            parentEl = $('#project-directory');
        }

        // add feature to DOM
        addFeature(parentEl, feature);
        // add feature to both task/feature modals
        addFeatureToFeatureModal(feature);
        addFeatureToTaskModal(feature);
    });

    socket.on('get task', function(task) {
        //add task to DOM
        if (whichUpdateTask == 1) {
            addTaskToReadTaskDom(task);
        }
        else if (whichUpdateTask == 2){
            updateTaskRead(task);
        }
    });
    
    socket.on('get feature', function(feature) {
        if (whichUpdateFeat == 1) {  // add feature to dom
            addFeatureToReadFeatureDom(feature);
        }
        else if (whichUpdateFeat == 2) {   // update read
            addParentToRead(feature);
        }
        
    });

    socket.on('remove feature', function (featureID) {
        console.log('remove feature:', featureID);
    });

    socket.on('add task', function (task, featureID) {
        // get task-list to add task to
        var parentEl = $('#'+featureID).parent().children('.task-list:first');

        // if task-list does not exist, create it and add it to the tasks parent el
        if (!parentEl.length) {
            var ul = $('<ul>').addClass('hierarchy-list task-list');
            $('#'+featureID).parent().append(ul);
            parentEl = ul;
        }

        // add task to DOM
        addTask(parentEl, task);
    });

    socket.on('remove task', function (taskID) {
        console.log('remove task:', taskID);
    });

    socket.on('add user', function (user) {
        $('#settings-user-list').append($('<li>').text(user.username));
    });

    /*===========================================
                  General Functions
     ===========================================*/
    function init(data) {
        // populate chat with messages
        data.messages.forEach(function (message) {
           addMessage(message);
        });

        // populate project directory with features & tasks
        data.project.forEach(function (feature) {
            addFeature($('#project-directory'), feature);
        });

        data.project_users.forEach(function (user) {
            $('#settings-user-list').append($('<li>').text(user.username));
            //$('#user-list').append($('<li class="online">').text(user.username));
        });

        data.user_list.forEach(function (name) {
            $('#user-list').append($('<li class="online">').text(name));
        });

        // clear newFeatureModal select and add a null option
        $('#newFeatureFormControlSelect1').empty().append( $('<option>').text('None').val(null));
        // clear newTaskModal select and add a null option
        $('#newTaskFormControlSelect1').empty();
        // populate newFeatureModal with features
        data.features.forEach(function (feature) {
            addFeatureToFeatureModal(feature);
            addFeatureToTaskModal(feature);
        });

        GanttChart.init(data.project);
    }

    /*===========================================
                    DOM Functions
     ===========================================*/
    /**
     * Add feature to #project-directory
     *
     * @param feature
     */
    function addFeature(el, feature) {

        // create icon (font awesome)
        var i = $('<i>').addClass('fas fa-caret-right');
        // create link and prepend the icon
        var a = $('<a>').text(feature.name)
            .attr('id', feature._id)
            .addClass('feature')
            .prepend(i);

        // create li and set html content to a
        var li = $('<li>').html(a);

        if (typeof feature.children !== 'undefined') {
            if ( feature.children.length > 0 ){
                var ul = $('<ul>').addClass('hierarchy-list feature-list');
                feature.children.forEach(function (child) {
                    addFeature(ul, child);
                });

                li.append(ul);
            }
        }

        if (typeof feature.tasks !== 'undefined') {
            if (feature.tasks.length > 0) {
                var ul = $('<ul>').addClass('hierarchy-list task-list');
                feature.tasks.forEach(function (task) {
                    addTask(ul, task);
                });

                li.append(ul);
            }
        }

        // append list item to the project list
        el.append(li);
    }

    /**
     *
     * @param task
     */
    function addTaskToReadTaskDom(task) {
        console.log(task);

        $('#readTaskModal').modal('toggle');
        var parentEl = $('#read_task_form_id');

        // set form html here
        $('#editTaskForm_name').text(task.name)
        $('#editTaskForm_description').text(task.description);

        //whichUpdateTask = -1;
        // parentEl.append(form);
    }

    function updateTaskRead(task) {
        //console.log("task id?" + task);
        var li = "<li>"+task.name+"</li>";
        $('#read-task-list').append(li);
        //$("read-task-list").find("#t"+task._id).text(""+);
        //whichUpdateTask = -1;
    }

    /**
     *
     * @param feature
     */
    function addFeatureToReadFeatureDom(feature) {
        console.log(feature);

        $('#readFeatureModal').modal('toggle');
        $('#rem-feat-mod-id').html("Feature: <strong>" + feature.name + "</strong>");
        if (feature.parent != null) {
            whichUpdateFeat = 2;
            socket.emit('get feature', feature.parent, projectID);
            //$('#read-parent').text(""+feature.parent);
        }
        else {
            $('#read-parent').text("---");
        }
        let startStr = ""+feature.est_start_date;
        let endStr = ""+feature.est_end_date;

        let startMon = findMonth((startStr.substring(5,7)-0));
        let endMon = findMonth((endStr.substring(5,7)-0));

        $('#read-start').text(startMon + " " + startStr.substring(8,10) + ", " + startStr.substring(0,4));
        $('#read-end').text(endMon + " " + endStr.substring(8,10) + ", " + endStr.substring(0,4));



        $('#read-task-list').empty();

        //var li = $('<li>').text(feature.tasks[0]);
        //$('#read-task-list').append(li);

        console.log("Task List:" + feature.tasks.length)
        
        if (feature.tasks.length == 0) {
            var li = "No Tasks";
            $('#read-task-list').append(li);
        }

        for (let i=0; i<feature.tasks.length; ++i) {
            console.log(feature.tasks[i]);
            //var li = $('<li>').text(""+feature.tasks[i]);
            //var li = "<li id=\"t" + feature.tasks[i] +"\"></li>";
            whichUpdateTask = 2;
            socket.emit('get task', feature.tasks[i], projectID);
            //$('#read-task-list').append(li);
        }

        //whichUpdateFeat = -1;
        // Loop through and add each task to list
        //var a = $('<a>').text(feature.name)
        //var li = $('<li>').html(a);
        //$('#read-task-list').append
        
        /*
        read-parent
        read-start
        read-end
        read-task-list
        */
        //var parentEl = $('#read_task_form_id');
        //var form = "<%= " + feature + " %>";
        //parentEl.append(form);
    }

    function addParentToRead(feature) {
        $('#read-parent').text(""+feature.name);
        //whichUpdateFeat = -1;
    }

    function addTask(el, task) {
        var classname = '';
        if (task.status === "Pending")
            classname = 'far fa-calendar';
        else if (task.status === "Started")
            classname = 'fa fa-calendar';
        else if (task.status === "Complete")
            classname = 'fa fa-calendar-check';
        else if (task.status === "Overdue")
            classname = 'fa fa-calendar-times';

        // create icon (font awesome)
        var i = $('<i>').addClass(classname);
        // create link and prepend the icon
        var a = $('<a>')
            .text(task.name)
            .attr('id', task._id)
            .addClass('task')
            .prepend(i);
        // create li and set html content to a
        var li = $('<li>').html(a);

        el.append(li);
    }


    /**
     * Creates the options for the feature dropdown in the create feature modal
     *
     * @param feature
     */
    function addFeatureToFeatureModal(feature) {
        const select1 = $('#newFeatureParent');
        select1.append( $('<option>').text(feature.name).val(feature._id));
        
    }

    /**
     * Creates the options for the feature dropdown in the create task modal
     *
     * @param feature
     */
    function addFeatureToTaskModal(feature) {
        const select1 = $('#featureIDForTask');
        select1.append( $('<option>').text(feature.name).val(feature._id));
    }

    /**
     * Add message to DOM
     *
     * @param data
     */
    function addMessage(message) {
        var date = new Date(message.timestamp);
        var time = $('<span class="time"></span>').text(date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }));

        var info = $('<div>').addClass('msg-info').text(message.user.username);
        var li = $('<li>').text(message.message);

        info.append(time);
        li.prepend(info);

        $('#messages').append(li);
        $('#messages')[0].scrollTop = $('#messages')[0].scrollHeight;
    }

    function findMonth(numMon) {
        if (numMon == 1){
            return "January";
        }
        else if(numMon == 2) {
            return "February";
        }
        else if(numMon == 3) {
            return "March";
        }
        else if(numMon == 4) {
            return "April";
        }
        else if(numMon == 5) {
            return "May";
        }
        else if(numMon == 6) {
            return "June";
        }
        else if(numMon == 7) {
            return "July";
        }
        else if(numMon == 8) {
            return "August";
        }
        else if(numMon == 9) {
            return "September";
        }
        else if(numMon == 10) {
            return "October";
        }
        else if(numMon == 11) {
            return "November";
        }
        else {
            return "December";
        }
    }
});