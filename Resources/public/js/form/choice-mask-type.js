(function ($, Sonata) {
    'use strict';

    /**
     * @constant
     * @type {string}
     */
    var WIDGET_SELECTOR = '.sonata-choice-mask-widget';

    /**
     *
     * @typedef {{
     *   id: string,
     *   parentId: string,
     *   fields: string[],
     *   fieldMap: {
     *      (string): string
     *   }
     * }} ChoiceMaskDescriptionType
     */

    /**
     *
     * @param {string} parentId
     * @param {string} fieldName
     * @returns {jQuery}
     */
    function getControlGroup (parentId, fieldName) {
        var controlGroupId = parentId + fieldName;
        return Sonata.Admin.getFormGroup(controlGroupId)
    }

    /**
     *
     * @param {ChoiceMaskDescriptionType} fieldDescription
     * @param {string} fieldName
     */
    function showFieldMask (fieldDescription, fieldName) {
        var fields = fieldDescription.fields;
        var fieldMap = fieldDescription.fieldMap;
        var parentId = fieldDescription.parentId;

        if (!fieldMap[fieldName]) {
            return fields.forEach(function (fieldName) {
                getControlGroup(parentId, fieldName).hide();
            });
        }
        fields.forEach(function (fieldName) {
            getControlGroup(parentId, fieldName).hide();
        });
        fieldMap[fieldName].forEach(function (fieldName) {
            getControlGroup(parentId, fieldName).show();
        });
    }

    function createChoiceMaskField ($subject) {
        var fieldDescription = $subject.data('fieldDescription');
        var $choiceField = Sonata.Admin.getField(fieldDescription.id);

        $choiceField.on('change', function () {
            showFieldMask(fieldDescription, $choiceField.val());
        });
        showFieldMask(fieldDescription, $choiceField.val());
    }

    function setupWidgets ($subject) {
        $subject.find(WIDGET_SELECTOR).each(function () {
            createChoiceMaskField($(this));
        });
    }

    $(function () {
        setupWidgets($(document));
    });
    $(document).on('sonata:domready', function (event) {
        setupWidgets($(event.target));
    });

}(jQuery, Sonata));