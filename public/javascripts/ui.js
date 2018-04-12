var UI = (function () {
    var module = {};

    module.create_alert = function (type, message) {
        var el = $('<div>').addClass('alert alert-'+ type +' alert-dismissible fade show');
        var btn = $('<button>')
            .attr('type', 'button')
            .attr('data-dismiss', 'alert')
            .addClass('close');

        btn.append($('<span>').html('&times;'));
        el.text(message);
        el.append(btn);

        return el;
    };

    return module;
})();