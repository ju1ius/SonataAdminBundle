(function ($, Sonata) {
    'use strict';

    var createAlert = Sonata.Admin.createAlert;
    var createSpinner = Sonata.Admin.createSpinner;
    var createSpinnerOverlay = Sonata.Admin.createSpinnerOverlay;

    function showDetailsSpinner ($details) {
        if (!$details.children().length) {
            return $details.append(createSpinner());
        }
        return $details.find('.box').append(createSpinnerOverlay()).end();
    }

    $(document).on('click', 'a[data-action="view-revision"], a[data-action="compare-revision"]', function (event) {
        event.preventDefault();
        event.stopPropagation();

        var $revisionLink = $(event.target);
        var $container = $revisionLink.closest('.sonata-ba-revisions');
        var $details = $container.find('.sonata-ba-revisions__details');
        var action = $revisionLink.data('action');

        if (action === 'view-revision') {
            $container
                .find('sonata-ba-revisions__revision--is-current')
                .removeClass('sonata-ba-revisions__revision--is-current')
            ;
        }

        showDetailsSpinner($details);
        $.ajax({
            url: $revisionLink.attr('href'),
            dataType: 'html'
        }).done(function (html) {
            $details.html(html);
        }).fail(function (response) {
            $details.empty().append(createAlert(response.statusText));
        });
    });

}(jQuery, Sonata));