var UI = (function () {
    var module = {};

    module.show_loader = function () {
        let loader = $('#main-loader');
        if( loader.hasClass('hidden') )
            loader.removeClass('hidden');
    };

    module.hide_loader = function () {

        setTimeout(function() {
            let loader = $('#main-loader');
            if( !loader.hasClass('hidden') )
                loader.addClass('hidden');
        }, 300);
    };

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