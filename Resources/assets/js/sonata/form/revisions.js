import $ from 'jquery';

import {createAlert} from 'sonata/ui/alert';
import {createSpinner, createSpinnerOverlay} from 'sonata/ui/spinner';


function showDetailsSpinner ($details) {
    if (!$details.children().length) {
        return $details.append(createSpinner());
    }
    return $details.find('.box').append(createSpinnerOverlay()).end();
}


$(document).on('click', 'a[data-action="view-revision"], a[data-action="compare-revision"]', event => {
    event.preventDefault();
    event.stopPropagation();

    var $revisionLink = $(event.currentTarget);
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
    }).done(html => {
        $details.html(html);
    }).fail(({statusText}) => {
        $details.empty().append(createAlert(statusText));
    });
});

