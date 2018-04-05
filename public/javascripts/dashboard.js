$(function () {
    const socket = io();

    var initiated = false;
    var userID = $('#user-info').attr('data-userID');
    var projectID = $('#project-directory').attr('data-projectID');

    /*===========================================
                    Send Events
    ===========================================*/
    socket.on('connect', function() {
        // connect function
        socket.emit('user connected', projectID);
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
        const parentID = $('#newFeatureParent').val();
        const name = $('#newFeatureName').val();;


        socket.emit('add feature', name, projectID, parentID);

        $('#newFeatureModal').modal('toggle');

        return false;
    });

    /**
     * Task form submit
     */
    $('#newTaskForm').submit(function(){
        // const name = "task test";
        // const description = "This is a task";
        // const featureID = $('#newTaskFormControlSelect1').val();
        // const est_start_date = new Date('2018-03-28T02:00:00');
        // const est_end_date = new Date('2018-04-01T02:00:00');
        // const status = "Pending";


        // socket.emit('add task', name, description, featureID, est_start_date, est_end_date, status);

        // $('#newTaskModal').modal('toggle');

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
        // const featureID = $('#feature').val;
        const featureID = 1;
        // const assignedTo = $('#assignedTo').val;
        const assignedTo = 1;
        const fromDate = $('#fromDate').val();
        const toDate = $('#toDate').val();

        const est_start_date = new Date(fromDate);
        const est_end_date = new Date(toDate);
        const status = "Pending";

        if (taskName.length < 1) {
            alert('task name cannot be empty');
        }

        const fromDateMonth = Number(fromDate.substring(0,2));
        const toDateMonth = Number(toDate.substring(0,2));
        const fromDateDay = Number(fromDate.substring(3,5));
        const toDateDay = Number(toDate.substring(3,5));
        const fromDateYear = Number(fromDate.substring(6,10));
        const toDateYear = Number(toDate.substring(6,10));
        const dateError = 'To date cannot be less than From date';
        var allGood = 1;
        
        if (fromDate.length > 10 || toDate.length > 10){
            alert('date cannot be longer than 10 characters');
            allGood = 0;
        } else if (fromDateMonth > 12 || toDateMonth > 12){
            alert('month cannot greater than 12');
            allGood = 0;
        } else if (fromDateDay > 31 || toDateDay > 31){
            alert('days cannot greater than 31');
            allGood = 0;
        } else if (fromDateYear < 2018 || toDateYear < 2018){
            alert('year cannot be less than 2018');
            allGood = 0;
        } else if (toDateYear < fromDateYear) {
            alert(date);
            allGood = 0;
        } else if (toDate < fromDate) {
            alert(dateError);
            allGood = 0;
        }

        if (Boolean(allGood)) {
            socket.emit('add task', taskName, description, featureID, est_start_date, est_end_date, status);
            $('#newTaskModal').modal('toggle');
            alert("Task added!");
        }
    });
    /*===========================================
                    Catch Events
     ===========================================*/
    socket.on('init', function (data) {
        console.log(data);
        // prevent double initiate on lost connection
        // there is probably a better solution?
        if (!initiated) {
            init(data);
            initiated = true;
        }
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


    function addFeatureToFeatureModal(feature) {
        const select1 = $('#newFeatureParent');
        select1.append( $('<option>').text(feature.name).val(feature._id));
    }

    function addFeatureToTaskModal(feature) {
        console.log('this is task:', feature);

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
});