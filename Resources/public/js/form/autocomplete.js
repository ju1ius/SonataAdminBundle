(function ($, Sonata) {
    'use strict';

    /**
     * @typedef {{
     *   id: string,
     *   label: string
     * }} AutocompleteResultType
     */

    /**
     * @typedef {{
     *   id: string,
     *   name: string,
     *   value: (AutocompleteResultType|AutocompleteResultType[]),
     *   requestData: object,
     *   requestParameterNames: {
     *      query: string,
     *      pageNumber: number,
     *   },
     *   select2: {
     *      multiple: boolean
     *   },
     *   dropdownItemCssClass: string
     * }} AutocompleteOptionsType
     */

    function getHiddenInputsContainer (fieldId) {
        return $('#' + fieldId + '_hidden_inputs_wrap');
    }

    /**
     *
     * @param {AutocompleteOptionsType} options
     * @returns {Function}
     */
    function createDataCallback (options) {
        var data = $.extend({}, options.requestData);
        return function (term, page) {
            data[options.requestParameterNames.query] = term;
            data[options.requestParameterNames.pageNumber] = page;
            return data;
        };
    }

    /**
     *
     * @param {string} itemClass
     * @param {AutocompleteResultType} item
     * @returns {string}
     */
    function formatResult (itemClass, item) {
        return ['<div class="', itemClass, '">', item.label, '</div>'].join('');
    }

    /**
     *
     * @param {AutocompleteResultType} item
     * @returns {string}
     */
    function formatSelection (item) {
        return item.label;
    }

    /**
     *
     * @param {string} markup
     * @returns {string}
     */
    function escapeMarkup (markup) {
        return markup;
    }

    function setupAutocomplete ($autocomplete) {
        /** @type {AutocompleteOptionsType} options */
        var options = $autocomplete.data('autocompleteOptions');
        var $hiddenInput = getHiddenInputsContainer(options.id);

        $autocomplete.select2($.extend(true, {}, options.select2, {
            ajax: {
                data: createDataCallback(options),
                results: function (data) {
                    // notice we return the value of more so Select2 knows if more results can be loaded
                    return {results: data.items, more: data.more};
                }
            },
            formatResult: formatResult.bind(null, options.dropdownItemCssClass),
            formatSelection: formatSelection,
            escapeMarkup: escapeMarkup
        }));

        $autocomplete.on('change', function (event) {
            // remove input
            if (event.removed) {
                var removedItems = event.removed;
                if (options.select2.multiple) {
                    if(!$.isArray(removedItems)) {
                        removedItems = [removedItems];
                    }
                    removedItems.forEach(function (item) {
                        $hiddenInput.find('input:hidden[value="' + item.id + '"]').remove();
                    });
                } else {
                    $hiddenInput.find('input:hidden').val('');
                }
            }
            // add new input
            if (event.added) {
                var addedItems = event.added;
                if (options.select2.multiple) {
                    if(!$.isArray(addedItems)) {
                        addedItems = [addedItems];
                    }
                    addedItems.forEach(function (item) {
                        var $input = $('<input type="hidden" />').attr({
                            name: options.name + '[]',
                            value: item.id
                        });
                        $hiddenInput.append($input);
                    });
                } else {
                    $hiddenInput.find('input:hidden').val(addedItems.id);
                }
            }
        });

        if (options.value) {
            $autocomplete.select2('data', options.value);
        }

        // remove unneeded autocomplete text input before form submit
        $autocomplete.closest('form').on('submit', function () {
            $autocomplete.remove();
        });
    }

    $(function () {
        $('.sonata-model-autocomplete').each(function () {
            setupAutocomplete($(this));
        });
    });
    $(document).on('sonata:domready', function (event) {
        $(event.target).find('.sonata-model-autocomplete').each(function () {
            setupAutocomplete($(this));
        });
    })

}(jQuery, Sonata));