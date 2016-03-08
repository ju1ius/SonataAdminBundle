/**
 * Sonata core object.
 * Config, translation, and DOM helpers.
 */
;(function (window, $, Sonata) {
    'use strict';

    // Merge default config with data passed from the templates.
    Sonata.config = $.extend({
        confirmExit: true,
        useSelect2: true,
        useICheck: true,
        useStickyForms: true
    }, Sonata.config || {});

    // Merge default translations with data passed from the templates.
    Sonata.i18n = $.extend({
        confirmExit: 'You have unsaved changes. Do you really want to leave ?',
        loadingInformation: 'Loading...'
    }, Sonata.i18n || {});

    Sonata.Admin = {

        //
        // Form helpers
        // ------------------------------------------------------------------------------------------------------------

        /**
         * Returns the form field with the given id.
         *
         * @param {string} fieldId
         * @param {(HTMLElement|jQuery)} [context]
         * @returns {jQuery}
         */
        getField: function (fieldId, context) {
            return $('#' + fieldId, context || document);
        },

        getFormGroup: function (fieldId, context) {
            return $('#sonata-ba-field-container-' + fieldId, context || document);
        },

        //
        // Form association fields helpers
        // ------------------------------------------------------------------------------------------------------------

        /**
         * Returns the field container of the association field identified by the given id.
         * Also has the class .field-container
         *
         * This container typically contains:
         *   * a #field_widget_{id} element containing the widget used to represent the association
         *   * a #field_actions_{id} element, hosting the action buttons (list, add, delete)
         *
         *
         * @param {string} fieldId
         * @param {(HTMLElement|jQuery)} [context]
         * @returns {jQuery}
         */
        getAssociationFieldContainer: function (fieldId, context) {
            return $('#field_container_' + fieldId, context || document);
        },

        /**
         * Returns the field widget of the association field identified by the given id.
         * Also has a class of:
         *   .field-short-description for sonata_type_model_list
         *
         * @param {string} fieldId
         * @param {(HTMLElement|jQuery)} [context]
         * @returns {jQuery}
         */
        getAssociationFieldWidget: function (fieldId, context) {
            return $('#field_widget_' + fieldId, context || document);
        },

        /**
         * Returns the element containing the association action buttons
         * of the association field identified by the given id.
         *
         * Also has the class .field-actions
         *
         * @param {string} fieldId
         * @param {(HTMLElement|jQuery)} [context]
         * @returns {jQuery}
         */
        getAssociationFieldActionsContainer: function (fieldId, context) {
            return $('#field_actions_' + fieldId, context || document);
        },

        /**
         * Returns the association action buttons of the association field identified by the given id.
         *
         * The action buttons should have the `.sonata-ba-action` class, along with a `data-field-action` attribute
         * identifying the action type (`list-association`, `add-association`, `remove-association`).
         *
         * @param {string} fieldId
         * @param {(HTMLElement|jQuery)} [context]
         * @returns {jQuery}
         */
        getAssociationFieldActions: function (fieldId, context) {
            return this.getAssociationFieldActionsContainer(fieldId, context)
                .find('.sonata-ba-action')
            ;
        },

        /**
         * Returns the the association action button with the given action type,
         * for the association field identified by the given id.
         *
         * @param {string} actionType
         * @param {string} fieldId
         * @param {(HTMLElement|jQuery)} [context]
         * @returns {jQuery}
         */
        getAssociationFieldAction: function (actionType, fieldId, context) {
            return this.getAssociationFieldActions(fieldId, context)
                .filter('[data-field-action="' + actionType + '"]')
            ;
        },

        //
        // List helpers
        // ------------------------------------------------------------------------------------------------------------

        /**
         * Returns the parent list field (cell) of the given element,
         * possibly limited to the given context element.
         *
         * @param {string|jQuery|HTMLElement} element
         * @param {(jQuery|HTMLElement)} [context]
         * @returns {jQuery}
         */
        getParentListField: function (element, context) {
            return $(element).closest('.sonata-ba-list-field', context || document);
        },


        //
        // Event helpers
        // ------------------------------------------------------------------------------------------------------------

        /**
         * Triggers an event on the specified target and returns a promise,
         * resolving or rejecting to that event.
         * If event.preventDefault() is called by a handler, the promise will reject.
         *
         * @param {string} name The event name
         * @param {jQuery} [target] (or document if undefined)
         * @param {object} [data] Custom data to pass to the handlers.
         *
         * @returns {jQuery.Deferred<jQuery.Event>}
         */
        triggerEvent: function (name, target, data) {
            var event = $.Event(name);
            return $.Deferred(function (promise) {
                $(target || document).trigger(event, data);
                if (event.isDefaultPrevented()) {
                    promise.reject(event);
                } else {
                    promise.resolve(event);
                }
            });
        },

        /**
         * Same as triggerEvent(), but fires on the next animation frame,
         * and returns a jQuery.Deferred resolving to that event.
         * Contrary to triggerEvent, the promise always resolves.
         *
         * @param {string} name
         * @param {jQuery} target
         * @param {object} [data]
         *
         * @returns {jQuery.Deferred<jQuery.Event>}
         */
        triggerEventAsync: function (name, target, data) {
            var event = $.Event(name);
            return $.Deferred(function (promise) {
                requestAnimationFrame(function () {
                    $(target).trigger(event, data);
                    promise.resolve(event);
                });
            });
        }
    };


    window.Sonata = Sonata;

    // Backward compatibility
    try {
        Object.defineProperty(window, 'Admin', {
            enumerable: true,
            get: function () {
                console.warn(
                    'The global Admin object has been deprecated in version 2.4.' +
                    'Please use the Sonata.Admin object'
                );
                return Sonata.Admin;
            }
        });
    } catch (err) {
        window.Admin = Admin;
    }


}(this, this.jQuery, (this.Sonata || {})));