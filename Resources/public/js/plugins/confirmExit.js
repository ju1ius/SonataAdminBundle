(function ($, Sonata) {
    'use strict';

    if (Sonata.config.confirmExit) {
        $(function () {
            $('.sonata-ba-form form').confirmExit(Sonata.i18n.confirmExit);
        });
    }

}(jQuery, Sonata));