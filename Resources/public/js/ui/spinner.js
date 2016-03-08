(function ($, Sonata) {
    "use strict";

    var DEFAULT_STATUS = Sonata.i18n.loadingInformation || 'Loading...';

    // TODO: should this be included in the main template ?.
    // see Resources/public/css/components/spinner.css
    var SPINNER_SYMBOL = [
        '<svg class="sonata-icon-spinner" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">',
            '<g transform="translate(20 50)">',
                '<rect x="-10" y="-30" width="20" height="60" />',
            '</g>',
            '<g transform="translate(50 50)">',
                '<rect x="-10" y="-30" width="20" height="60" />',
            '</g>',
            '<g transform="translate(80 50)">' +
                '<rect x="-10" y="-30" width="20" height="60" />',
            '</g>',
        '</svg>'
    ].join('');

    Sonata.Admin.createSpinnerIcon = function () {
        return $(SPINNER_SYMBOL);
    };

    /**
     * Returns a spinner element with given size and given status text.
     *
     * @param {number|string} size
     * @param {string} [status]
     * @returns {jQuery}
     */
    Sonata.Admin.createSpinner = function (size, status) {
        var $icon = $(SPINNER_SYMBOL).addClass('sonata-spinner__icon').css({
            width: size || 64,
            height: size || 64
        });
        var $status = $('<span class="sonata-spinner__status sr-only" role="status" />').text(status || DEFAULT_STATUS);
        return $('<span class="sonata-spinner" />').append($icon).append($status);
    };

    Sonata.Admin.createSpinnerOverlay = function (size, status) {
        return $('<div class="overlay spinner-overlay text-primary" />')
            .append(Sonata.Admin.createSpinner(size, status));
    };

}(jQuery, Sonata));