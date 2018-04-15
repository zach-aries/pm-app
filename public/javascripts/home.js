$(function () {
    $('#loader-wrapper').toggleClass('hidden');

    $("#loginForm").submit(function(event) {
        event.preventDefault();
        $('#login-response').empty();
        $('#loader-wrapper').toggleClass('hidden');

        $.ajax({
            url: '/login',
            dataType: 'json',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: $(this).serialize(),
            success: function (data, textStatus, jQxhr) {
                if (data.error) {
                    $('#login-response').append( UI.create_alert('danger', data.error) );
                    $( "#loginModal" ).effect( "shake" );
                    UI.hide_loader();
                }

                if (data.url)
                    location.href = data.url;

            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

    });

    $("#registerForm").submit(function(event) {
        event.preventDefault();
        $('#register-response').empty();
        $('#loader-wrapper').toggleClass('hidden');

        $.ajax({
            url: '/register',
            dataType: 'json',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: $(this).serialize(),
            success: function (data, textStatus, jQxhr) {
                if (data.valErrors || data.error) {
                    $('#registerModal').effect('shake');

                    if (data.valErrors) {
                        data.valErrors.forEach(function (error) {
                            $('#register-response').append( UI.create_alert('danger', error.msg) );
                            console.log(error);
                        });
                    }

                    if (data.error) {
                        $('#register-response').append( UI.create_alert('danger', data.error) );
                    }

                    $('#loader-wrapper').toggleClass('hidden');
                }

                if (data.url)
                    location.href = data.url;
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });

    });
});