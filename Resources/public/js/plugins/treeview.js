(function ($) {
    'use strict';

    function setupTreeView ($subject) {
        $subject.find('ul.js-treeview').treeView();
    }

    $(function () {
        setupTreeView($(document));
    });
    $(document).on('sonata:domready', function (event) {
        setupTreeView($(event.target));
    })

}(jQuery));