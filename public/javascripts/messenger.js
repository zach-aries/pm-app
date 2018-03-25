$(function () {
    const socket = io();
    /*===========================================
                    Send Events
    ===========================================*/
    socket.on('connect', function() {
        // connect function
        socket.emit('user connected');
    });

    /**
     * Messenger form submit, parses message and
     * sends to server.
     */
    $('#chat-input').submit(function(){
        const msg = $('#msg').val();

        // check to make sure the message includes a character
        if (msg.match(/\S/)) {
            var data = {
                username: $('#username').text(),
                msg:msg
            };

            // emit message to server and add li with msg to chat box
            socket.emit('message', data);

            // clear chat entry
            $('#msg').val('');
        }

        return false;
    });

    /*===========================================
                    Catch Events
     ===========================================*/
    socket.on('init', function (data) {
        init(data);
    });

    socket.on('message', function (data) {
        // add message to DOM
        addMessage(data);
    });

    /*===========================================
                  General Functions
     ===========================================*/
    function init(data) {
        for (var i = 0; i < data.messages.length; i++) {
            addMessage(data.messages[i]);
        }
    }

    /*===========================================
                    DOM Functions
     ===========================================*/
    /**
     * Add message to DOM
     *
     * @param data
     */
    function addMessage(data) {

        var date = new Date(data.timestamp);
        var time = $('<span class="time"></span>').text(date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }));

        var info = $('<div>').addClass('msg-info').text(data.user);
        var li = $('<li>').text(data.message);

        info.append(time);
        li.prepend(info);

        $('#messages').append(li);
        $('#messages')[0].scrollTop =  $('#messages')[0].scrollHeight;
    }
    /*
    <li>
    <div class="msg-info">Michael<span class="time">12:11 AM</span></div>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum non porttitor magna. Cras dictum est at tortor rhoncus, eget lacinia justo lobortis.
</li>
     */
});