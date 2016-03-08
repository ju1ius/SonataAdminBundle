;(function (window) {
    'use strict';

    /**
     * Console shame for really old brwsers.
     */
    function devNull () {}

    if (!window.console) {
        window.console = {};
    }
    ['log', 'warn', 'error'].forEach(function (method) {
        if (typeof window.console[method] !== 'function') {
            window.console[method] = devNull;
        }
    });

}(this));