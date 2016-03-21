import $ from 'jquery';

const {slice} = Array.prototype;


/**
 * Unfortunately, we cannot use event delegation here, since the iCheck click events do not bubble,
 * and the project is unmaintained. So we reinitialize everything on dom load...
 */

// ???
// var BATCH_CHECKBOX_SELECTOR = [
//    'td.sonata-ba-list-field-batch input[type="checkbox"]',
//    'div.sonata-ba-list-field-batch input[type="checkbox"]'
// ].join(',');

const BATCH_CHECKBOX_SELECTOR = '.sonata-ba-list-field-batch input[type="checkbox"]';

/**
 * Returns the checkbox related to the given .iCheck-helper element (the "visual" checkbox).
 *
 * @param {jQuery} $helper
 * @returns {jQuery}
 */
function getCheckboxForICheckHelper ($helper) {
    return $helper.closest('.sonata-ba-list-field-batch').find(':checkbox');
}

/**
 * Returns all the batch checkboxes that are in the same list that the one passed.
 *
 * @param {jQuery} $checkbox
 * @returns {jQuery}
 */
function getBatchCheckboxes ($checkbox) {
    return $checkbox.closest('.sonata-ba-list').find(BATCH_CHECKBOX_SELECTOR);
}

/**
 * Returns a slice of the given checkboxes list, containing all the checkboxes between
 * currentIndex and previousIndex.
 *
 * @param {jQuery} $checkboxes
 * @param {number} currentIndex
 * @param {number} previousIndex
 * @returns {Array.<jQuery>}
 */
function getCheckboxesSlice ($checkboxes, currentIndex, previousIndex) {
    const [start, end] = currentIndex < previousIndex
        ? [currentIndex, previousIndex]
        : [previousIndex, currentIndex]
    ;
    return slice.call($checkboxes, start, end);
}


function setupShiftSelection ($list) {
    let lastCheckboxClicked = {
        index: 0,
        checked: true
    };

    $list.find('.sonata-ba-list-field-batch .iCheck-helper').on('click', ({target, shiftKey}) => {
        const $checkbox = getCheckboxForICheckHelper($(target));
        const $checkboxes = getBatchCheckboxes($checkbox);
        const currentIndex = $checkboxes.index($checkbox);
        if (shiftKey) {
            getCheckboxesSlice($checkboxes, currentIndex, lastCheckboxClicked.index).forEach(cb => {
                $(cb).iCheck(lastCheckboxClicked.checked ? 'check' : 'uncheck');
            });
        }
        lastCheckboxClicked = {
            index: currentIndex,
            checked: $checkbox.prop('checked')
        };
    });
}


function setupMasterCheckbox ($list) {
    const $batchController = $list.find('#list_batch_checkbox');
    if (!$batchController.length) {
        return;
    }

    $batchController.on('ifChanged', ({target}) => {
        $(target)
            .closest('.sonata-ba-list')
            .find(BATCH_CHECKBOX_SELECTOR)
            .iCheck(target.checked ? 'check' : 'uncheck');
    });
    $list
        .find(BATCH_CHECKBOX_SELECTOR)
        .on('ifChanged', ({target}) => {
            $(target)
                .closest('tr, .sonata-ba-list-field-batch')
                .toggleClass('sonata-ba-list-row-selected', target.checked);
        });
}


function setupBatchSelection ($list) {
    setupMasterCheckbox($list);
    setupShiftSelection($list);
}


$(() => {
    $('.sonata-ba-list').each((i, el) => setupBatchSelection($(el)));
});
$(document).on('sonata:domready', ({target}) => {
    $(target).find('.sonata-ba-list').each((i, el) => setupBatchSelection($(el)));
});
