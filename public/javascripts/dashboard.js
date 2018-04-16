$(function () {
    const socket = io();

    let initiated = false;
    let userID = $('#user-info').attr('data-userID');
    let projectID = $('#project-directory').attr('data-projectID');

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

    $('#projectSettings-form').submit(function(){
        let name = $('#projectSettings-name').val();
        let desc = $('#projectSettings-desc').val();
        let errors = [];

        // validation checks
        // check if name has content
        if ( !name.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid project name'
            });
        }

        // check if desc has content
        if ( !desc.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid project description'
            });
        }

        // clear response div
        $('#projectSettings-response').empty();

        // submit for if no errors
        if (errors.length === 0) {
            // display loader
            UI.show_loader();
            // sent info to server
            socket.emit('update project', projectID, name, desc);

            // disable form inputs
            toggle_form_disabled($('#projectSettings-form'));
            // dismiss modal
            $('#projectSettingsModal').modal('toggle');
        } else { // otherwise handle errors
            // create an alert for each error
            errors.forEach(function (err) {
               $('#projectSettings-response').append(UI.create_alert('danger', err.message));
            });
        }

        // prevent form submit
        return false;
    });

    $('#delete-project').click(function () {
        const name = $('#projectSettings-name').val();
        const name_cnfm = $('#projectSettings-delete').val();
        let errors = [];

        if (name === name_cnfm ) {
            UI.show_loader();
            socket.emit('delete project', projectID);
        } else {
            errors.push({
                error: 'validation',
                message: 'Please confirm project name to delete'
            });

            errors.forEach(function (err) {
                $('#projectSettings-response').append(UI.create_alert('danger', err.message));
            });
        }
    });

    /**
     * Feature form submit
     */
    $('#newFeatureForm').submit(function(){

        // set inputs
        let parentID = $('#newFeatureParent').val();
        const name = $('#newFeatureName').val();
        const start_date = $('#datepickerFeatureS').val();
        const end_date = $('#datepickerFeatureF').val();
        const d_start_date = new Date(start_date);
        const d_end_date = new Date(end_date);

        let errors = [];

        // validation

        // check if name has content
        if ( !name.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid feature name'
            });
        }

        // check if start date has format 00/00/0000
        if ( !start_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

        // check if start date has format 00/00/0000
        if ( !end_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

        if ( d_end_date < d_start_date ) {
            errors.push({
                error: 'validation',
                message: 'End date cannot be before estimated start date'
            });
        }

        $('#newFeature-response').empty();
        // submit for if no errors
        if (errors.length === 0) {
            // If no parent specified, send null
            if (parentID === 'null') {
                parentID = null;
            }

            // display loader
            UI.show_loader();
            // sent info to server
            socket.emit('add feature', name, projectID, parentID, start_date, end_date);

            

            // dismiss modal
            $('#newFeatureModal').modal('toggle');


            // Clear Modal
            $('#newFeatureName').text("");
            $('#datepickerFeatureS').val('').datepicker('update');
            $('#datepickerFeatureF').val('').datepicker('update');
        } else { // otherwise handle errors
            // create an alert for each error
            errors.forEach(function (err) {
                $('#newFeature-response').append(UI.create_alert('danger', err.message));
            });
        }

        // prevent default
        return false;
    });

    $('#editFeature-form').submit(function(){
        // set inputs
        const _id = $('#readFeatureModal').attr('data-featureID');
        const name = $('#editFeature-name').val();
        const start_date = $('#editFeature-startDate').val();
        const end_date = $('#editFeature-endDate').val();
        const d_start_date = new Date(start_date);
        const d_end_date = new Date(end_date);

        let errors = [];

        // validation

        // check if name has content
        if ( !name.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid feature name'
            });
        }

        // check if start date has format 00/00/0000
        if ( !start_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

        // check if start date has format 00/00/0000
        if ( !end_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

        // make sure start date comes before end date
        if ( d_end_date < d_start_date ) {
            errors.push({
                error: 'validation',
                message: 'End date cannot be before estimated start date'
            });
        }

        $('#newFeature-response').empty();
        // submit for if no errors
        if (errors.length === 0) {
            // display loader
            UI.show_loader();
            // sent info to server
            socket.emit('update feature', _id, name, d_start_date, d_end_date);

            // dismiss modal
            $('#readFeatureModal').modal('toggle');
            // disable input
            toggle_form_disabled($('#editFeature-form'));
        } else { // otherwise handle errors
            // create an alert for each error
            errors.forEach(function (err) {
                $('#readFeature-response').append(UI.create_alert('danger', err.message));
            });
        }

        return false;
    });

    $('#add-users').click(function () {
        const user = $('#projectSettingsAddUser').val();
        let errors = [];

        // validation checks
        // check if name has content
        if ( !user.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid username'
            });
        }

        $('#projectSettingsUsers-response').empty();
        if (errors.length === 0) {
            UI.show_loader();
            socket.emit('add user', user, projectID);
            // clear input value
            $('#projectSettingsAddUser').val('');
        } else {
            // create an alert for each error
            errors.forEach(function (err) {
                $('#projectSettingsUsers-response').append(UI.create_alert('danger', err.message));
            });
        }
    });

    /**
     * Task form submit
     */
    $('#newTaskForm').submit(function(){
        // set inputs
        const name = $('#taskName').val();
        const description = $('#description').val();
        const featureID = $('#newTaskFeatureID').val();
        const assignedTo = $('#newTask-assignedTo').val();
        const start_date = $('#newTask-startDate').val();
        const end_date = $('#newTask-endDate').val();

        const d_start_date = new Date(start_date);
        const d_end_date = new Date(end_date);
        const status = "Pending";

        let errors = [];

        // validation

        // check if name has content
        if ( !name.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid task name'
            });
        }

        // check if feature is assigned
        if ( !featureID.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please select a parent feature'
            });
        }

        //check if description has content
        if ( !description.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid description name'
            });
        }

        // check if start date has format 00/00/0000
        if ( !start_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

        // check if start date has format 00/00/0000
        if ( !end_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

        if ( d_end_date < d_start_date ) {
            errors.push({
                error: 'validation',
                message: 'End date cannot be before estimated start date'
            });
        }


        $('#newTask-response').empty();
        // submit for if no errors
        if (errors.length < 1) {
            // display loader
            UI.show_loader();
            // sent info to server
            socket.emit('add task', name, description, featureID, assignedTo, projectID, d_start_date, d_end_date, status);

            

            // dismiss modal
            $('#newTaskModal').modal('toggle');

            // Clear modals
            $('#description').text("");
            $('#newTaskFeatureID').text("");
            $('#newTask-assignedTo').text("");
            $('#newTask-startDate').val('').datepicker('update');
            $('#newTask-endDate').val('').datepicker('update');
        } else { // otherwise handle errors
            // create an alert for each error
            errors.forEach(function (err) {
                $('#newTask-response').append(UI.create_alert('danger', err.message));
            });
        }

        // prevent default*/
        return false;
    });

    $('#editTask-form').submit(function(){
        // set inputs
        const _id = $('#readTaskModal').attr('data-task-id');
        const name = $('#editTask-name').val();
        const description = $('#editTask-description').val();
        const responsible = $('#editTask-assignedTo').val();
        const start_date = $('#editTask-startDate').val();
        const end_date = $('#editTask-endDate').val();
        const d_start_date = new Date(start_date);
        const d_end_date = new Date(end_date);

        let errors = [];

        // validation

        // check if name has content
        if ( !name.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid task name'
            });
        }

        if ( !description.match(/\S/)) {
            errors.push({
                error: 'validation',
                message: 'Please enter a valid task description'                
            });
        }

        // check if start date has format 00/00/0000
        if ( !start_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

        // check if start date has format 00/00/0000
        if ( !end_date.match(/\d\d\/\d\d\/\d\d\d\d/)) {
            errors.push({
                error: 'validation',
                message: 'Please select an estimated start date'
            });
        }

         // make sure start date comes before end date
         if ( d_end_date < d_start_date ) {
            errors.push({
                error: 'validation',
                message: 'End date cannot be before estimated start date'
            });
        }

        $('#newTask-response').empty();
        // submit for if no errors
        if (errors.length === 0) {
            // display loader
            UI.show_loader();
            // sent info to server
            socket.emit('update task', _id, name, description, responsible, d_start_date, d_end_date);

            // dismiss modal
            $('#readTaskModal').modal('toggle');
            // disable input
            toggle_form_disabled($('#editTask-form'));
        } else { // otherwise handle errors
            // create an alert for each error
            errors.forEach(function (err) {
                $('#readTask-response').append(UI.create_alert('danger', err.message));
            });
        }

        return false;
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

    socket.on('update project', function (project_info) {
        update_projectSettings(project_info);
        UI.hide_loader();
    });

    socket.on('delete project', function () {
        location.href = '/dashboard/projects';
    });

    socket.on('update project-tree', function (project) {
        GanttChart.init(project);
    });

    socket.on('message', function (message) {
        // add message to DOM
        addMessage(message);
    });

    socket.on('userlist update', function (userList) {
        let temp = '';
        for(i=0;i<userList.length;i++) {
            temp = temp + '<li class="online">' + userList[i];
        }
        $('#user-list').html(temp);
    });

    socket.on('add feature', function (feature) {
        // create parent let for later
        let parentEl;
        if (feature.parent !== null) {
            // if feature has a parent, then add it as a sub feature
            // get feature-list to add feature to
            parentEl = $('#'+feature.parent).parent().children('.feature-list:first');

            // if feature-list doesnt exist, create a new one and add it to the features parent el
            if (!parentEl.length) {
                let ul = $('<ul>').addClass('hierarchy-list feature-list');
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
        $('#newFeatureParent').append( $('<option>').text(feature.name).val(feature._id));
        $('#editFeature-parent').append( $('<option>').text(feature.name).val(feature._id));
        $('#newTaskFeatureID').append( $('<option>').text(feature.name).val(feature._id));

        UI.hide_loader();
    });

    socket.on('update feature', function (feature) {
        $('#'+feature._id).find('.feature-name').text(feature.name);

        UI.hide_loader();
    });

    socket.on('get task', function(task) {
        const start_date = new Date(task.est_start_date);
        const end_date = new Date(task.est_end_date);
        const datepicker_s = $('#editTask-startDate').datepicker();
        const datepicker_e = $('#editTask-endDate').datepicker();

        $('#editTask-assignedTo').val(task.responsible);

        datepicker_s.value(pad(start_date.getMonth()+1)+"/"+ pad(start_date.getDate())+"/"+start_date.getFullYear());
        datepicker_e.value(pad(end_date.getMonth()+1)+"/"+ pad(end_date.getDate())+"/"+end_date.getFullYear());

        $('#editTask-name').val(task.name);
        $('#editTask-description').val(task.description);
    });
    
    socket.on('get feature', function(feature) {
        set_readModal(feature);
    });

    socket.on('remove feature', function (featureID, features) {
        $('#'+featureID).parent().remove();
        init_feature_modal_selects(features);

        UI.hide_loader();
    });

    socket.on('add task', function (task, featureID) {
        // get task-list to add task to
        let parentEl = $('#'+featureID).parent().children('.task-list:first');

        // if task-list does not exist, create it and add it to the tasks parent el
        if (!parentEl.length) {
            let ul = $('<ul>').addClass('hierarchy-list task-list');
            $('#'+featureID).parent().append(ul);
            parentEl = ul;
        }

        socket.emit('get todo-list', userID, projectID);

        // add task to DOM
        addTask(parentEl, task);
    });

    socket.on('update todo-list', function (todolist) {
        init_todoList(todolist)
        UI.hide_loader();
    });

    socket.on('update task', function (task) {
        $('#'+task._id).find('.task-name').text(task.name);

        UI.hide_loader();
    });

    socket.on('remove task', function (taskID) {
        $('#'+taskID._id).parent().remove();

        UI.hide_loader();
    });

    socket.on('add user', function (user, error) {
        UI.hide_loader();
        if (user !== null) {
            // the variable is defined
            $('#settings-user-list').append($('<li>').text(user.username));
        } else {
            $('#projectSettingsUsers-response').append(UI.create_alert('danger', error));
        }

    });

    /*===========================================
                  General Functions
     ===========================================*/
    function init(data) {
        // Initiate Date Picker
        $('.date-picker').each(function () {
            $(this).datepicker({
                uiLibrary: 'bootstrap4'
            });
        });

        // init project settings modal
        init_projectSettings(data.project_info, data.project_users);

        // initiate project directory
        init_projectDir(data.project);

        // initiate messenger
        init_messenger(data.messages, data.user_list);

        // init all feature selects
        init_feature_modal_selects(data.features);

        // init all user selects
        init_user_model_selects(data.project_users);

        // init task list with responsible tasks
        init_todoList(data.todo_list);

        GanttChart.init(data.project);
        UI.hide_loader();
    }
    function init_projectSettings(project_info, project_users){
        // set project settings
        update_projectSettings(project_info);

        // set project users
        project_users.forEach(function (user) {
            $('#settings-user-list').append($('<li>').text(user.username));
            //$('#user-list').append($('<li class="online">').text(user.username));
        });
    }

    function init_projectDir(project) {
        $('#project-directory').empty();
        // populate project directory with features & tasks
        project.forEach(function (feature) {
            addFeature($('#project-directory'), feature);
        });
    }

    function init_feature_modal_selects(features) {
        // populate newFeatureModal with features
        const newFeatureParent = $('#newFeatureParent');
        const editFeatureParent = $('#editFeature-parent');
        const newTaskFeatureID = $('#newTaskFeatureID');

        // clear selects
        newFeatureParent.empty();
        editFeatureParent.empty();
        newTaskFeatureID.empty();

        // add null values for feature creation / update
        newFeatureParent.append($('<option>').text('(Root)').val('null'));
        editFeatureParent.append($('<option>').text('(Root)').val('null'));

        // add actual features to selects
        features.forEach(function (feature) {
            newTaskFeatureID.append( $('<option>').text(feature.name).val(feature._id));
            newFeatureParent.append( $('<option>').text(feature.name).val(feature._id));
            editFeatureParent.append( $('<option>').text(feature.name).val(feature._id));
        });
    }

    function init_user_model_selects(users) {

        const select_newTask = $('#newTask-assignedTo');
        const select_editTask = $('#editTask-assignedTo');

        select_newTask.empty();
        select_editTask.empty();

        users.forEach(function (user) {
            select_newTask.append($('<option>').text(user.username).val(user._id));
            select_editTask.append($('<option>').text(user.username).val(user._id));
        });

    }

    function init_messenger(messages, users) {
        // populate chat with messages
        messages.forEach(function (message) {
            addMessage(message);
        });

        // add online users to chat users
        users.forEach(function (name) {
            $('#user-list').append($('<li class="online">').text(name));
        });
    }

    function init_todoList(tasks) {
        let taskList = $('#task-list');

        taskList.empty();

        tasks.forEach(function (task) {
            let li = $('<li>').html(
                $('<a>')
                    .text(task.name)
                    .addClass('todo-task')
                    .attr('data-id', task._id)
            );
            taskList.append(li);
        });
    }

    /*===========================================
                    DOM Functions
     ===========================================*/
    $('#project-directory').on('click', 'span.caret', function(event) {
        event.stopImmediatePropagation();

        $(this).parent().parent().toggleClass('closed');
        $(this).find('svg').toggleClass('closed');
    });

    $('#project-directory').on('click', 'a.feature', function() {
        const featureID = $(this).attr('id');
        socket.emit('get feature', featureID, projectID);


        $('#readFeatureModal').modal('toggle').attr('data-featureID', featureID);
        $('.store-id').attr("id", featureID);
    });

    // Read task from project menu
    $('#project-directory').on('click', 'a.task', function() {
        const taskID = $(this).attr('id');
        socket.emit('get task', taskID, projectID);

        $('#readTaskModal').modal('toggle');
        $('#readTaskModal').attr('data-task-id', taskID);
    });

    $('#task-list').on('click', 'a.todo-task', function() {
        const name = $(this).text();
        let msg = '';

        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            msg = 'Has started working on: ' + name;
        } else {
            msg = 'Has stopped working on: ' + name;
        }

        socket.emit('message', userID, projectID, msg);
    });



    //delete feature from feature section
    $('#delete-featureBtn').click(function() {
        const featureID = $('#readFeatureModal').attr('data-featureID');

        UI.show_loader();
        socket.emit('remove feature', featureID, projectID);
        $('#readFeatureModal').modal('toggle');
        toggle_form_disabled($('#editFeature-form'));
    });

    //delete task from feature section
    $('#delete-taskBtn').click(function(event) {
        const taskID = $('#readTaskModal').attr('data-task-id');

        UI.show_loader();
        socket.emit('remove task', taskID);
        $('#readTaskModal').modal('toggle');
        toggle_form_disabled($('#editTask-form'));
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
    });

    /**
     * toggles disabled attribute on all input elements for
     * specified form.
     * button must have data-target attribute specified for target form
     * inputs with class "no-edit" will not be affected
     */
    $('button.edit').click(function (event) {
        const form = $('#'+$(this).attr('data-target'));
        toggle_form_disabled(form);
    });

    function toggle_form_disabled(form) {
        form.find('.delete').each(function () {
            $(this).toggleClass('hidden');
        });

        form.find('input, select, textarea, button[type=submit], .btn-danger').each(function () {
            let el = $(this);
            if (! el.hasClass('no-edit') ) {
                if (el.attr('disabled')) {
                    el.removeAttr('disabled');
                } else {
                    el.attr('disabled', '');
                }
            }
        });
    }

    function update_projectSettings(project_info) {
        $('#projectSettingsModal').attr('data-projectID', project_info._id);
        $('#projectSettings-name').val(project_info.name);
        $('#project-name').text(project_info.name);
        $('#projectSettings-desc').val(project_info.description);
    }

    /**
     * Add feature to #project-directory
     *
     * @param el
     * @param feature
     */
    function addFeature(el, feature) {

        // create icon (font awesome)
        let span = $('<span>')
            .addClass('caret')
            .html($('<i>').addClass('fas fa-caret-down'));
        // create link and prepend the icon
        let a = $('<a>')
            .html($('<span>').text(feature.name).addClass('feature-name'))
            .attr('id', feature._id)
            .addClass('feature closed')
            .prepend(span);

        // create li and set html content to a
        let li = $('<li>').html(a);

        if (typeof feature.tasks !== 'undefined') {
            if (feature.tasks.length > 0) {
                let ul = $('<ul>').addClass('hierarchy-list task-list');
                feature.tasks.forEach(function (task) {
                    addTask(ul, task);
                });

                li.append(ul);
            }
        }

        if (typeof feature.children !== 'undefined') {
            if ( feature.children.length > 0 ){
                let ul = $('<ul>').addClass('hierarchy-list feature-list');
                feature.children.forEach(function (child) {
                    addFeature(ul, child);
                });

                li.append(ul);
            }
        }



        // append list item to the project list
        el.append(li);
    }

    function set_readModal(feature) {
        const start_date = new Date(feature.est_start_date);
        const end_date = new Date(feature.est_end_date);
        const datepicker_s = $('#editFeature-startDate').datepicker();
        const datepicker_e = $('#editFeature-endDate').datepicker();

        datepicker_s.value(pad(start_date.getMonth()+1)+"/"+ pad(start_date.getDate())+"/"+start_date.getFullYear());
        datepicker_e.value(pad(end_date.getMonth()+1)+"/"+ pad(end_date.getDate())+"/"+end_date.getFullYear());

        $('#editFeature-name').val(feature.name);
        if (feature.parent === null ) {
            $('#editFeature-parent').val('null');
        } else {
            $('#editFeature-parent').val(feature.parent);
        }

        $('#readFeature-tasks').empty();
        feature.tasks.forEach(function (task) {
            let esd = new Date(task.est_start_date);
            let eed = new Date(task.est_end_date);


            let tr = $('<tr>')
                .append($('<td>').text(task.name))
                .append($('<td>').text(task.status))
                .append($('<td>').text(pad(esd.getMonth()+1)+"/"+ pad(esd.getDate())+"/"+esd.getFullYear()))
                .append($('<td>').text(pad(eed.getMonth()+1)+"/"+ pad(eed.getDate())+"/"+eed.getFullYear()));

            $('#readFeature-tasks').append(tr);
        });
    }

    function pad(n) {return n < 10 ? "0"+n : n;}

    function addParentToRead(feature) {
        $('#read-parent').text(""+feature.name);
        //whichUpdateFeat = -1;
    }

    /**
     *
     * @param task
     */
    function addTaskToReadTaskDom(task) {
        $('#readTaskModal').modal('toggle');
        let parentEl = $('#read_task_form_id');

        // set form html here
        $('#editTaskForm_name').text(task.name)
        $('#editTaskForm_description').text(task.description);
        $('#editTaskForm_assignTo').text(task.responsible);

        let startStr = "" + task.est_start_date;
        let endStr = "" + task.est_end_date;

        let startMon = findMonth((startStr.substring(5,7)-0));
        let endMon = findMonth((endStr.substring(5,7)-0));

        $('#editTaskForm_strDate').text(startMon + " " + startStr.substring(8,10) + ", " + startStr.substring(0,4));
        $('#editTaskForm_endDate').text(endMon + " " + endStr.substring(8,10) + ", " + endStr.substring(0,4));
    }

    function updateTaskRead(task) {
        //console.log("task id?" + task);
        let li = "<li>"+task.name+"</li>";
        $('#read-task-list').append(li);
        //$("read-task-list").find("#t"+task._id).text(""+);
        //whichUpdateTask = -1;
    }

    function addTask(el, task) {
        let classname = '';
        if (task.status === "Pending")
            classname = 'far fa-calendar';
        else if (task.status === "Started")
            classname = 'fa fa-calendar';
        else if (task.status === "Complete")
            classname = 'fa fa-calendar-check';
        else if (task.status === "Overdue")
            classname = 'fa fa-calendar-times';

        // create icon (font awesome)
        let i = $('<i>').addClass(classname);
        // create link and prepend the icon
        let a = $('<a>')
            .append($('<span>').addClass('task-name').text(task.name))
            .attr('id', task._id)
            .addClass('task')
            .prepend(i);
        // create li and set html content to a
        let li = $('<li>').html(a);

        el.append(li);
    }

    /**
     * Add message to DOM
     *
     * @param data
     */
    function addMessage(message) {
        let date = new Date(message.timestamp);
        let time = $('<span class="time"></span>').text(date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }));

        let info = $('<div>').addClass('msg-info').text(message.user.username);
        let li = $('<li>').text(message.message);

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