;(function (window, $, Sonata) {
    'use strict';

    //
    // Events documentation
    // ----------------------------------------------------------------------------------------------------------------

    //TODO: replace objectId by data-object-id

    /**
     * Sonata DOMReady event.
     *
     * @event sonata:domready
     *
     * @property {jQuery} target The root element of the newly inserted DOM.
     */

    /**
     * Fires before the value of an association is updated.
     *
     * @event sonata:association-update
     *
     * @property {jQuery} target The form field that will be updated.
     * @property {object} data
     * @property {string} data.objectId The id of the associated object
     */

    /**
     * Fires after the value of an association was updated.
     *
     * @event sonata:association-updated
     *
     * @property {jQuery} target The form field that was updated.
     * @property {object} data
     * @property {string} data.objectId The id of the associated object
     */

    /**
     * Fires when a new empty association form is about to be appended.
     *
     * @event 'sonata:association-add'
     *
     * @property {jQuery} target The form widget that will receive the new field.
     * @property {object} data
     * @property {string} data.objectId The id of the associated object
     */

    /**
     * Fires when a new empty association was appended.
     *
     * @event 'sonata:association-added'
     *
     * @property {jQuery} target The field that was just added.
     * @property {object} data
     * @property {string} data.objectId The id of the associated object
     */

    /**
     * Fires before a new item is added to a collection form.
     *
     * @event sonata:native-collection-item-add
     *
     * @property {jQuery} target The form widget that will receive the new item.
     * @property {object} data
     * @property {jQuery} data.item The element to be inserted
     * @property {jQuery} data.prototype The container
     */

    /**
     * Fires after a new item was added to a collection form.
     *
     * @event sonata:native-collection-item-added
     *
     * @property {jQuery} target The inserted item.
     */

    /**
     * Fires before a new item is removed from a collection form.
     *
     * @event sonata:native-collection-item-delete
     *
     * @property {jQuery} target The item to be removed.
     */

    /**
     * Fires after a new item was removed from a collection form.
     *
     * @event sonata:native-collection-item-deleted
     *
     * @property {jQuery} target The element from which the item was removed.
     */


    //
    // Main application bootstrap.
    // ---------------------------------------------------------------------------------------------------------------

    /**
     * Bootstrap on initial page load.
     */
    $(function() {
        $('html').removeClass('no-js');
    });

    function logEvent (event) {
        var args = [].slice.call(arguments, 1);
        console.log.apply(console, [event.type].concat(args));
    }

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

}(this, this.jQuery, this.Sonata));
