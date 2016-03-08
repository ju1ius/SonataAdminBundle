(function ($, Sonata, undefined) {
    'use strict';

    var map = Array.prototype.map;

    /**
     * @constant
     * @type {RegExp}
     */
    var CSS_WIDTH_RX = /width:(auto|(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc)))/i

    /**
     * Return the width for simple and sortable select2 element
     */
    function getSelect2Width ($element){
        // this code is an adaptation of select2 code (initContainerWidth function)
        var style = $element.attr('style');
        if (style !== undefined) {
            var attrs = style.split(';');
            for (var i = 0, l = attrs.length; i < l; i = i + 1) {
                var matches = attrs[i].replace(/\s/g, '').match(CSS_WIDTH_RX);
                if (matches !== null && matches.length >= 1) {
                    return matches[1];
                }
            }
        }

        style = $element.css('width');
        if (style.indexOf("%") > 0) {
            return style;
        }

        return '100%';
    }

    function createSelect2 ($subject) {
        var allowClearEnabled = false;
        var popover = $subject.data('popover');

        $subject.removeClass('form-control');

        if ($subject.find('option[value=""]').length || $subject.data('sonataSelect2AllowClear')) {
            allowClearEnabled = true;
        }

        $subject.select2({
            width: function () {
                return getSelect2Width(this.element);
            },
            dropdownAutoWidth: true,
            minimumResultsForSearch: 10,
            allowClear: allowClearEnabled
        });

        if (popover) {
            $subject.select2('container').popover(popover.options);
        }
    }

    /**
     * Creates a sortable select2 widget.
     * Choices are passed to the hidden input via data-select2-choices attribute.
     *
     * @param {jQuery} $subject
     */
    function createSortableSelect2 ($subject) {
        var choices = map.call($subject.data('select2Choices'), function (item) {
            return {id: item.data, text: item.label};
        });

        $subject.select2({
            width: function () {
                return getSelect2Width(this.element);
            },
            dropdownAutoWidth: true,
            data: choices,
            multiple: true
        });

        $subject.select2("container").find("ul.select2-choices").sortable({
            containment: 'parent',
            start: function () {
                $subject.select2("onSortStart");
            },
            update: function () {
                $subject.select2("onSortEnd");
            }
        });

        // On form submit, transform value to match what is expected by server
        var $form = $subject.closest('form');
        $form.on('submit', function () {
            var values = $subject.val().trim();
            if (values !== '') {
                var baseName = $subject.attr('name');
                baseName = baseName.substring(0, baseName.length - 1);
                var inputs = values.split(',').map(function (value) {
                    return $('<input type="hidden"/>').attr('name', baseName + i + ']').val(value);
                });
                $form.append(inputs);
            }
            $subject.remove();
        });
    }

    function setupSelect2 ($subject) {
        $subject.find('select:not([data-sonata-select2="false"])').each(function () {
            createSelect2($(this));
        });
        $subject.find('.sonata-select2-sortable').each(function () {
            createSortableSelect2($(this));
        });
    }

    if (Sonata.config.useSelect2) {
        $(function () {
            setupSelect2($(document));
        });
        $(document).on('sonata:domready', function (event) {
            setupSelect2($(event.target));
        });
    }

}(jQuery, Sonata));