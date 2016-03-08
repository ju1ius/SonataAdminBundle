(function ($) {
    'use strict';

    //
    // Form errors.
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @typedef {{
     *   pane: jQuery,
     *   trigger: jQuery,
     *   hasError: boolean
     * }} TabType
     */

     var forEach = Array.prototype.forEach;
     var map = Array.prototype.map;

    /**
     * Returns true if we shouldn't set the aria-invalid attribute on an input.
     * (e.g. disabled, button, etc...)
     *
     * @param {HTMLElement} input
     * @returns {boolean}
     */
    function cannotBeInvalid (input) {
        return !!(
            input.disabled
            || input.readonly
            || ['hidden', 'button', 'submit', 'reset', 'image'].indexOf(input.type) > -1
        );
    }

    /**
     * Returns whether element contains descendants latching selector.
     *
     * @param {string} selector
     * @param {jQuery|HTMLElement} element
     * @returns {boolean}
     */
    function containsSelector (selector, element) {
        return !!$(element).find(selector).length;
    }
    var containsClientSideError = containsSelector.bind(null, ':invalid');
    var containsServerSideError = containsSelector.bind(null, '.sonata-ba-field-error');

    /**
     * Returns an array of TabType objects for the given form.
     *
     * @param {jQuery} $form
     * @param {Function} hasError
     * @returns {TabType[]}
     */
    function getFormTabs ($form, hasError) {
        return map.call($form.find('.tab-pane'), function (tab) {
            var $trigger = $form.find('[data-toggle="tab"][href="#' + tab.id + '"]');
            return {
                pane: $(tab),
                trigger: $trigger,
                hasError: hasError(tab)
            };
        });
    }

    /**
     * Returns a TabType objects contains an error.
     *
     * @param {TabType} tab
     * @returns {boolean}
     */
    function tabHasError (tab) {
        return !!tab.hasError;
    }

    /**
     * Filters out tabs that do not have errors.
     *
     * @param {TabType[]} tabs
     * @returns {TabType[]}
     */
    function keepInvalidTabs (tabs) {
        return tabs.filter(tabHasError);
    }

    /**
     * Mark tabs containing errors.
     *
     * @param {TabType[]} tabs
     * @returns {TabType[]}
     */
    function markInvalidTabs (tabs) {
        tabs.forEach(function (tab) {
            if (tabHasError(tab)) {
                tab.trigger.parent().addClass('has-error');
            } else {
                tab.trigger.parent().removeClass('has-error');
            }
        });

        return tabs;
    }

    /**
     * For a group of tabs, find the first one having an error and set it as the active tab.
     *
     * @param {TabType[]} tabs
     * @returns {TabType}
     */
    function switchToFirstInvalidTab (tabs) {
        var tab = keepInvalidTabs(tabs)[0];
        if (tab) {
            tab.trigger.tab('show');
            return tab;
        }
    }

    /**
     * For a given element, find the first error container.
     *
     * @param {jQuery} $element
     * @returns {jQuery}
     */
    function findFirstInvalidField($element) {
        return $element.find('.sonata-ba-field-error').first();
    }

    /**
     * Sets the aria-invalid attribute on all inputs set as invalid by the server.
     *
     * @param {HTMLFormElement} form
     */
    function setInvalidStatesFromServer (form) {
        forEach.call(form.elements, function (input) {
            if (cannotBeInvalid(input)) {
                return;
            }
            if ($(input).closest('.sonata-ba-field-error').length) {
                input.setAttribute('aria-invalid', true);
            } else {
                input.setAttribute('aria-invalid', false);
            }
        });
    }

    function setupForms ($element) {
        forEach.call($element.find('form'), function (form) {
            var tabs = getFormTabs($(form), containsServerSideError);
            if (tabs.length) {
                markInvalidTabs(tabs);
                switchToFirstInvalidTab(tabs);
            }
            setInvalidStatesFromServer(form);
        });
        var $field = findFirstInvalidField($element);
        if ($field.length) {
            var $formGroup = $field.closest('.form-group');
            // scrollIntoViewOptions is currently FF only :/
            ($formGroup.length ? $formGroup : $field)[0].scrollIntoView({behavior: 'smooth'});
            $field.find(':input').focus();
        }
    }

    $(function () {
        setupForms($(document));
    });
    $(document).on('sonata:domready', function (event) {
        setupForms($(event.target));
    });
    //TODO: client-side validation
    //$(subject)
    //    .on('click', 'form [type="submit"]', function() {
    //        Admin.show_form_first_tab_with_errors($(this).closest('form'), ':invalid');
    //    })
    //    .on('keypress', 'form [type="text"]', function(e) {
    //        if (13 === e.which) {
    //            Admin.show_form_first_tab_with_errors($(this), ':invalid');
    //        }
    //    })


    //
    // Inline form errors.
    // ----------------------------------------------------------------------------------------------------------------

    /**
     * @constant
     * @type {string}
     */
    var DELETE_CHECKBOX_SELECTOR = '.sonata-ba-field-inline-table [id$="_delete"][type="checkbox"]';

    /**
     * Disables inline form errors when the row is marked for deletion
     */
    function toggleInlineFormErrors ($subject) {
        var $row = $subject.closest('.sonata-ba-field-inline-table');
        var $errors = $row.find('.sonata-ba-field-error-messages');

        if ($subject.is(':checked')) {
            $row.find('[required]').removeAttr('required').attr('data-required', 'required');
            $errors.hide();
        } else {
            $row.find('[data-required]').attr('required', 'required');
            $errors.show();
        }
    }

    function setupInlineFormErrors ($subject) {
        $subject.find(DELETE_CHECKBOX_SELECTOR).each(function() {
            toggleInlineFormErrors($(this));
        });
        $subject.on('change', DELETE_CHECKBOX_SELECTOR, function(event) {
            toggleInlineFormErrors($(event.target));
        });
    }

    $(function () {
        setupInlineFormErrors($(document));
    });
    $(document).on('sonata:domready', function (event) {
        setupInlineFormErrors($(event.target));
    });

}(jQuery));