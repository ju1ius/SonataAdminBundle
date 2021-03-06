import $ from 'jquery';

import merge from 'sonata/util/merge';
import curry from 'sonata/util/curry';


/**
 * The result object returned by the server.
 *
 * @private
 * @typedef {object} AutocompleteResultType
 * @property {string} id The id of the object
 * @property {string} label It's textual description
 */

/**
 * @private
 * @typedef {object} AutocompleteConfigType
 * @property {string} id The id of the autocomplete element.
 * @property {string} name The name of the autocomplete element.
 * @property {(AutocompleteResultType|AutocompleteResultType[])} value The initial value of the autocomplete input.
 * @property {object} requestData Additional request data to send to the server.
 * @property {string} dropdownItemCssClass CSS class to apply to the result items.
 * @property {object} requestParameterNames Configures the parameter names to use for the request.
 * @property {string} requestParameterNames.query The name of the request parameter used for searching items.
 * @property {number} requestParameterNames.pageNumber The name of the request parameter used for the page number.
 * @property {object} select2 Options for the select2 widget.
 * @property {boolean} select2.multiple Whether the select2 field allows multiple values.
 */

const getHiddenInputsContainer = fieldId => $(`#${fieldId}_hidden_inputs_wrap`);

/**
 *
 * @param {AutocompleteConfigType} options
 * @returns {Function}
 */
function createDataCallback ({requestData, requestParameterNames: {query, pageNumber}}) {
    return (term, page) => ({
        ...requestData,
        [query]: term,
        [pageNumber]: page
    });
}

/**
 *
 * @param {string} itemClass
 * @param {AutocompleteResultType} item
 * @returns {string}
 */
const formatResult = curry((itemClass, {label}) => `<div class="${itemClass}">${label}</div>`);

/**
 *
 * @param {AutocompleteResultType} item
 * @returns {string}
 */
const formatSelection = ({label}) => label;

/**
 * Just return the markup untouched since we allow html in results.
 *
 * @param {string} markup
 * @returns {string}
 */
const escapeMarkup = markup => markup;


function createAutocompleteWidget ($autocomplete) {
    /** @type {AutocompleteConfigType} */
    var options = $autocomplete.data('autocompleteConfig');
    var $hiddenInput = getHiddenInputsContainer(options.id);

    $autocomplete.select2(merge({}, options.select2, {
        ajax: {
            data: createDataCallback(options),
            // notice we return the value of more so Select2 knows if more results can be loaded
            results: ({items, more}) => ({results: items, more})
        },
        formatResult: formatResult(options.dropdownItemCssClass),
        formatSelection: formatSelection,
        escapeMarkup: escapeMarkup
    }));

    $autocomplete.on('change', event => {
        // remove input
        if (event.removed) {
            var removedItems = event.removed;
            if (options.select2.multiple) {
                if(!$.isArray(removedItems)) {
                    removedItems = [removedItems];
                }
                removedItems.forEach(item => {
                    $hiddenInput.find(`input:hidden[value="${item.id}"]`).remove();
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
                addedItems.forEach(item => {
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
    $autocomplete.closest('form').on('submit', () => $autocomplete.remove());
}


function setupAutocompletes ($target) {
    $target.find('.sonata-model-autocomplete').each((i, element) => createAutocompleteWidget($(element)));
}


$(() => setupAutocompletes($(document)));
$(document).on('sonata:domready', ({target}) => setupAutocompletes($(target)));
