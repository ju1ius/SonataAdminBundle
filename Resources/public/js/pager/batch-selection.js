(function ($, Sonata) {
    'use strict';

    /**
     * Unfortunately, we cannot use event delegation here, since the iCheck click events do not bubble,
     * and the project is unmaintained. So we reinitialize everything on dom load...
     */

    // ???
    //var BATCH_CHECKBOX_SELECTOR = [
    //    'td.sonata-ba-list-field-batch input[type="checkbox"]',
    //    'div.sonata-ba-list-field-batch input[type="checkbox"]'
    //].join(',');

    var BATCH_CHECKBOX_SELECTOR = '.sonata-ba-list-field-batch input[type="checkbox"]';

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
        var positions = currentIndex < previousIndex
            ? [currentIndex, previousIndex]
            : [previousIndex, currentIndex]
        ;
        return [].slice.call($checkboxes, positions[0], positions[1]);
    }

    function setupShiftSelection ($list) {
        var lastCheckboxClicked = {
            index: 0,
            checked: true
        };

        $list.find('.sonata-ba-list-field-batch .iCheck-helper').on('click', function (event) {
            var $checkbox = getCheckboxForICheckHelper($(event.target));
            var $checkboxes = getBatchCheckboxes($checkbox);
            var currentIndex = $checkboxes.index($checkbox);
            if (event.shiftKey) {
                getCheckboxesSlice($checkboxes, currentIndex, lastCheckboxClicked.index).forEach(function (cb) {
                    $(cb).iCheck(lastCheckboxClicked.checked ? 'check' : 'uncheck');
                });
            }
            lastCheckboxClicked = {
                index: currentIndex,
                checked: $checkbox.prop('checked')
            };
        });
    }

    function setupBatchSelection ($list) {
        var $batchController = $list.find('#list_batch_checkbox');
        if (!$batchController.length) {
            return;
        }

        $batchController.on('ifChanged', function () {
            $batchController
                .closest('.sonata-ba-list')
                .find(BATCH_CHECKBOX_SELECTOR)
                .iCheck($batchController.is(':checked') ? 'check' : 'uncheck')
            ;
        });
        $list.find(BATCH_CHECKBOX_SELECTOR).on('ifChanged', function () {
            var $checkBox = $(this);
            $checkBox
                .closest('tr, .sonata-ba-list-field-batch')
                .toggleClass('sonata-ba-list-row-selected', $checkBox.is(':checked'))
            ;
        });

        setupShiftSelection($list);
    }

    $(function () {
        $('.sonata-ba-list').each(function () {
            setupBatchSelection($(this));
        });
    });
    $(document).on('sonata:domready', function (event) {
        $(event.target).find('.sonata-ba-list').each(function () {
            setupBatchSelection($(this));
        });
    });

}(jQuery, Sonata));