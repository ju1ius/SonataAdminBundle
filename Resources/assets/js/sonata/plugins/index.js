import $ from 'jquery';

import config from 'sonata/config';

import setupSelect2 from './select2';
import setupICheck from './icheck';
import setupTreeViews from './treeview';
import setupXEditable from './xeditable';
import setupConfirmExit from './confirmExit';
import setupStickyElements from './sticky';


const $doc = $(document);


$(() => {
    setupStickyElements($doc);

    if (config.confirmExit) {
        setupConfirmExit($doc);
    }
    if (config.useSelect2) {
        setupSelect2($doc);
    }
    if (config.useICheck) {
        setupICheck($doc);
    }
    setupTreeViews($doc);
    setupXEditable($doc);
});

$doc.on('sonata:domready', event => {
    const $target = $(event.target);

    if (config.confirmExit) {
        setupConfirmExit($target);
    }
    if (config.useSelect2) {
        setupSelect2($target);
    }
    if (config.useICheck) {
        setupICheck($target);
    }
    setupTreeViews($target);
    setupXEditable($target);
});
