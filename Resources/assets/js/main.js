import $ from 'jquery';

import config from 'sonata/config';
import i18n from 'sonata/i18n';
import * as formHelpers from 'sonata/form/util';
import * as listHelpers from 'sonata/list/util';
import * as Legacy from 'sonata/legacy';

// plugins
import 'sonata/plugins';

// Components
import 'sonata/list';
import 'sonata/form';


/**
 * @namespace
 */
const {Sonata = {
    debug: true
}} = window;


//
// Expose the public API through the global Sonata namespace
// --------------------------------------------------------------------------------------------------------------------

/**
 * @property {object} Sonata.config
 */
Sonata.config = config;


/**
 * @property {object} Sonata.i18n
 */
Sonata.i18n = i18n;


/**
 * @namespace
 */
Sonata.Admin = {
    ...formHelpers,
    ...listHelpers
};

window.Sonata = Sonata;


//
// Bootstrap
// --------------------------------------------------------------------------------------------------------------------


/**
 * Bootstrap on initial page load.
 */
$(() => {
    $('html').removeClass('no-js');
});

// eslint-disable-next-line no-console
const logEvent = ({type}, ...args) => console.log(type, ...args);

if (Sonata.debug) {
    $(document)
        .on('sonata:association-update', logEvent)
        .on('sonata:association-updated', logEvent)
        .on('sonata:association-add', logEvent)
        .on('sonata:association-added', logEvent)
        .on('sonata:collection-item-add', logEvent)
        .on('sonata:collection-item-added', logEvent)
        .on('sonata:native-collection-item-add', logEvent)
        .on('sonata:native-collection-item-added', logEvent)
        .on('sonata:native-collection-item-delete', logEvent)
        .on('sonata:native-collection-item-deleted', logEvent)
        .on('sonata:domready', logEvent)
    ;
}

//
// Expose the deprecated API through the global Admin namespace
// --------------------------------------------------------------------------------------------------------------------

let youBeenWarned = false;
Object.defineProperty(window, 'Admin', {
    enumerable: true,
    get: function () {
        if (!youBeenWarned) {
            console.warn(
                'The global Admin object and his methods have been deprecated in version 2.4,' +
                'And will be removed in 3.0.'
            );
            youBeenWarned = true;
        }

        return Legacy;
    }
});
