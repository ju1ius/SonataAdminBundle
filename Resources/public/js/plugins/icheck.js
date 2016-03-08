(function ($, Sonata) {
    'use strict';

    /**
     * @constant
     * @type {string}
     */
    var ICHECK_SELECTOR = [
        'input[type="checkbox"]:not("label.btn>input")',
        'input[type="radio"]:not("label.btn>input")'
    ].join(',');

    /**
     * @constant
     * @type {string}
     */
    var CHECKBOX_CSS_CLASS = 'icheckbox_square-blue';

    /**
     * @constant
     * @type {string}
     */
    var RADIO_CSS_CLASS = 'iradio_square-blue';


    function setupICheck ($subject) {
        $subject
            .find(ICHECK_SELECTOR)
            .iCheck({
                checkboxClass: CHECKBOX_CSS_CLASS,
                radioClass: RADIO_CSS_CLASS
            })
        ;
    }

    if (Sonata.config.useICheck) {
        $(function () {
            setupICheck($(document));
        });
        $(document).on('sonata:domready', function (event) {
            setupICheck($(event.target));
        });
    }

}(jQuery, Sonata));