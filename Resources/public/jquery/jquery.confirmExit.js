/*!
* jQuery confirmExit plugin
* https://github.com/dunglas/jquery.confirmExit
*
* Copyright 2012 Kévin Dunglas <dunglas@gmail.com>
* Released under the MIT license
* http://www.opensource.org/licenses/mit-license.php
*/
(function ($) {
    "use strict";

    var some = Array.prototype.some;

    function handleWindowUnload (message, event) {
        var e = event || window.event;
        var hasChanged = some.call($('form[data-original]'), function (form) {
            //FIXME: jQuery.serialize() doesn't handle file inputs.
            return form.getAttribute('data-original') !== $(form).serialize();
        });

        if (hasChanged) {
            // For old IE and Firefox
            if (e) {
                e.returnValue = message;
            }

            return message;
        }
    }

    var attached = false;

    $.fn.confirmExit = function (message) {
        return this.each(function() {
            var $form = $(this);
            $form.attr('data-original', $form.serialize());

            $form.on('submit', function() {
                $form.removeAttr('data-original');
            });
            if (!attached) {
                $(window).on('beforeunload', handleWindowUnload.bind(this, message));
                attached = true;
            }
        });
    };

})(jQuery);
