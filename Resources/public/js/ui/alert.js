(function ($, Sonata) {
    'use strict';

    var ALERT_TEMPLATE = [
        '<div class="alert alert-danger alert-dismissible" role="alert">',
            '<button class="close" aria-label="Close">',
                '<i class="fa fa-close"></i>',
            '</button>',
            '<div class="alert-body"></div>',
        '</div>'
    ].join('');

    /**
     * Creates a dismissible alert box.
     *
     * @param {string} message The error message
     * @returns {jQuery}
     */
    Sonata.Admin.createAlert = function (message) {
        return $(ALERT_TEMPLATE)
            .find('.alert-body').html(message).end()
            .alert()
        ;
    };

    /**
     * Returns a dismissible overlay containing an error alert box.
     *
     * @param {string} message
     * @returns {jQuery}
     */
    Sonata.Admin.createAlertOverlay = function (message) {
        return $('<div class="overlay alert-overlay"/>')
            .append(Sonata.Admin.createAlert(message))
            .one('click', function () {
                $(this).remove();
            })
        ;
    };

}(jQuery, Sonata));