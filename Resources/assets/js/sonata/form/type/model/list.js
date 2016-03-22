import $ from 'jquery';

import './list.css';

import merge from 'sonata/util/merge';
import curry from 'sonata/util/curry';
import containsSelector from 'sonata/util/containsSelector';


import getField from 'sonata/form/util/getField';
import getAssociationFieldContainer from 'sonata/form/util/getAssociationFieldContainer';
import getAssociationFieldWidget from 'sonata/form/util/getAssociationFieldWidget';
import getParentListField from 'sonata/list/util/getParentListField';
import ajaxSubmit from 'sonata/form/util/ajaxSubmit';

import {
    triggerCancelableEvent,
    triggerAsyncEvent
} from 'sonata/util/event';
import {createSpinner} from 'sonata/ui/spinner';
import {createAlertOverlay} from 'sonata/ui/alert';
import Dialog from 'sonata/ui/dialog';

import getFieldDescription from 'sonata/form/util/getFieldDescription';


//
// Type definitions
// -----------------------------------------------------------------------------------------------------------------

/**
 * @private
 * @typedef {object} FieldActionType
 * @property {FieldDescriptionType} fieldDescription
 * @property {Dialog} [dialog]
 */


/**
 * @constant
 * @type {string}
 */
const EDIT_MODE_LIST = 'list';

/**
 * @constant
 * @type {string}
 */
const EDIT_MODE_STANDARD = 'standard'; // eslint-disable-line no-unused-vars


//
// Utilities
// -----------------------------------------------------------------------------------------------------------------

/**
 * Returns whether the given element is an anchor inside the same page.
 *
 * @param {jQuery} $el
 * @returns {boolean}
 */
function isAnchor ($el) {
    const href = $el.attr('href');
    return $el.is('a') && (!href || href[0] === '#');
}

const containsOption = containsSelector('option');

/**
 * Returns a new modal dialog from a FieldDescriptionType,
 * and injects it into the document.
 *
 * @param {FieldDescriptionType} fieldDescription
 * @returns {Dialog}
 */
const createActionDialog = ({label}) => new Dialog(label).appendTo(document.body);

/**
 * Returns a FieldActionType object.
 *
 * @param {FieldDescriptionType} fieldDescription
 * @param {Dialog} [dialog]
 * @returns {FieldActionType}
 */
const createFieldAction = (fieldDescription, dialog) => ({fieldDescription, dialog});

/**
 * @param {FieldActionType} action
 * @returns {jQuery.Deferred.<FieldActionType>}
 */
const showActionDialog = (action) => action.dialog.open().then(() => action);

/**
 * @param {FieldActionType} action
 * @returns {jQuery.Deferred.<FieldActionType>}
 */
const closeActionDialog = (action) => action.dialog.close().then(() => action);

/**
 * @param {FieldActionType} action
 * @param {string} html
 * @returns {jQuery.Deferred.<FieldActionType>}
 *
 * @fires sonata:domready
 */
const populateActionDialog = curry((action, html) => action.dialog.setContent(html).then(() => action));

/**
 * @param {FieldActionType} action
 *
 * @returns {jQuery.Deferred.<FieldActionType>}
 */
const showDialogSpinner = (action) => action.dialog.showSpinner().then(() => action);

/**
 * Called when a request triggered by a field action fails.
 *
 * @param {FieldActionType} action
 * @param {jqXHR} xhr
 * @returns {jQuery.Deferred.<FieldActionType>}
 */
const handleActionRequestError = curry((action, xhr) => populateActionDialog(action, xhr.responseText));

/**
 * In sonata_type_model_list, when the associated entity is set,
 * we update the hidden input field and fetch the entity short description.
 *
 * @param {FieldDescriptionType} fieldDescription
 * @param {string} objectId
 *
 * @returns {jQuery.Deferred}
 *
 * @fires sonata:association-update
 * @fires sonata:association-updated
 */
function updateShortObjectDescription (fieldDescription, objectId) {
    const fieldId = fieldDescription.id;
    const $field = getField(fieldId);
    const eventArgs = [objectId, merge({}, fieldDescription)];

    // FIXME: does this really make sense to make the event cancelable ?
    return triggerCancelableEvent('sonata:association-update', $field, eventArgs).then(() => {
        $field.val(objectId);
        getAssociationFieldWidget(fieldId).addClass('loading').empty().append(createSpinner(24));
        return $.ajax({
            url: fieldDescription.routes.shortObjectDescription.replace('__OBJECT_ID__', objectId),
            dataType: 'html'
        }).done(html => {
            const $widget = getAssociationFieldWidget(fieldId);
            $widget.removeClass('loading').html(html);
            triggerAsyncEvent('sonata:association-updated', $widget, eventArgs);
        }).fail(({statusText}) => {
            getAssociationFieldWidget(fieldId).removeClass('loading').empty().append(
                $('<span class="inner-field-short-description text-danger"/>').text(statusText)
            );
        });
    });
}

/**
 * In sonata_type_model, when a new associated entity was created,
 * we re-fetch the whole association form and replace the old one.
 *
 * @param {FieldDescriptionType} fieldDescription
 * @param {string} objectId
 *
 * @returns {jQuery.Deferred}
 *
 * @fires sonata:association-update
 * @fires sonata:association-updated
 */
function retrieveAssociationField (fieldDescription, objectId) {
    const fieldId = fieldDescription.id;
    const $widget = getAssociationFieldWidget(fieldId);
    const $form = $widget.closest('form');
    const eventArgs = [objectId, merge({}, fieldDescription)];

    // FIXME: does this really make sense to make the event cancelable ?
    return triggerCancelableEvent('sonata:association-update', $widget, eventArgs).then(() => {
        return ajaxSubmit($form, {
            url: fieldDescription.routes.retrieveFormElement,
            method: 'post',
            dataType: 'html'
        }).done(html => {
            getAssociationFieldContainer(fieldId, $form).replaceWith(html);
            const $field = getField(fieldId, $form);
            const $newElement = $field.find(`[value="${objectId}"]`);
            if ($newElement.is('input')) {
                $newElement.attr('checked', 'checked');
            } else {
                $newElement.attr('selected', 'selected');
            }
            getAssociationFieldContainer(fieldId, $form).trigger('sonata:domready');
            triggerAsyncEvent('sonata:association-updated', $field, eventArgs);
        }).fail(response => {
            getAssociationFieldContainer(fieldId).closest('.box').append(
                createAlertOverlay(response.statusText)
            );
        });
    });

}

/**
 * handle link click in a list :
 *  - if the parent has an objectId defined then the related input gets updated
 *  - if the parent has NO objectId then an ajax request is made to continue normal navigation.
 *
 * @param {Event} event
 *
 * @returns {null|jQuery.Deferred}
 *
 * @fires sonata:association-update
 * @fires sonata:association-updated
 */
function handleListDialogClick (event) {
    const $link = $(event.currentTarget);
    const action = event.data;

    if (isAnchor($link)) {
        return null;
    }

    event.preventDefault();
    event.stopPropagation();

    const $parentListField = getParentListField($link, action.dialog.body);
    if (!$parentListField.length) {
        // the user does not click on a row column, continue normal navigation (i.e. filters, etc...)
        return showDialogSpinner(action)
            .then(() => $.ajax({url: $link.attr('href'), dataType: 'html'}))
            .done(populateActionDialog(action))
            .fail(handleActionRequestError(action))
        ;
    }

    return updateShortObjectDescription(action.fieldDescription, $parentListField.attr('objectId'))
        .always(() => closeActionDialog(action))
    ;
}

/**
 * Handle form submissions in list dialog, and continue navigation.
 *
 * @param {Event} event
 */
function handleListDialogSubmit (event) {
    event.preventDefault();
    const action = event.data;
    const $form = $(event.target);

    showDialogSpinner(action)
        .then(() => ajaxSubmit($form, {url: $form.attr('action'), method: $form.attr('method'), dataType: 'html'}))
        .done(populateActionDialog(action))
        .fail(handleActionRequestError(action))
    ;
}

/**
 * Handle navigation in the create dialog.
 *
 * @param {Event} event
 */
function handleCreateDialogClick (event) {
    const $target = $(event.currentTarget);
    const action = event.data;

    // a click on a tab, a sonata action, etc...
    if (isAnchor($target) || $target.hasClass('sonata-ba-action')) {
        return;
    }
    event.preventDefault();

    showDialogSpinner(action)
        .then(() => ajaxSubmit($target, {url: $target.attr('href'), method: 'get'}))
        .done(populateActionDialog(action))
        .fail(handleActionRequestError(action))
    ;
}

/**
 * Handle form submissions in the create dialog.
 *
 * @param {Event} event
 *
 * @fires sonata:submit
 */
function handleCreateDialogSubmit (event) {
    const $form = $(event.target);
    const action = event.data;

    event.preventDefault();
    // let listeners cancel the event, e.g. for client-side validation
    triggerCancelableEvent('sonata:submit', $form)
        .then(() => showDialogSpinner(action))
        .then(() => {
            ajaxSubmit($form, {url: $form.attr('action'), method: $form.attr('method')})
                .done(response => {
                    // if the crud action return ok, then the element has been added
                    // so the widget container must be refresh with the last option available
                    if (response.result !== 'ok') {
                        return populateActionDialog(action, response);
                    }
                    closeActionDialog(action).then(({fieldDescription}) => {
                        if (fieldDescription.editMode === EDIT_MODE_LIST) {
                            // The field is a sonata_type_model_list
                            return updateShortObjectDescription(fieldDescription, response.objectId);
                        }
                        // The field is a sonata_type_model
                        return retrieveAssociationField(fieldDescription, response.objectId);
                    });
                })
                .fail(handleActionRequestError(action))
            ;
        })
    ;
}

/**
 * Shows the dialog to choose an association from a list view.
 *
 * @param {string} url
 * @param {FieldActionType} action
 */
function showListDialog (url, action) {
    showActionDialog(action)
        .then(() => $.ajax(url, {dataType: 'html'}))
        .done(html => {
            populateActionDialog(action, html);
            // setup event listeners on the modal, passing our action
            action.dialog.body
                .on('click', 'a', action, handleListDialogClick)
                .on('submit', 'form', action, handleListDialogSubmit);
        })
        .fail(handleActionRequestError(action))
    ;
}

/**
 * Shows the dialog to create a new association.
 *
 * @param {string} url
 * @param {FieldActionType} action
 */
function showCreateDialog (url, action) {
    showActionDialog(action)
        .then(() => $.ajax(url, {dataType: 'html'}))
        .done(html => {
            populateActionDialog(action, html);
            // setup event listeners on the modal, passing our action
            action.dialog.body
                .on('click', 'a', action, handleCreateDialogClick)
                .on('submit', 'form', action, handleCreateDialogSubmit);
        })
        .fail(handleActionRequestError(action))
    ;
}

/**
 * Shows the dialog to display an existing association.
 *
 * @param {FieldActionType} action
 */
function showShowDialog (action) {
    const {fieldDescription} = action;
    const $input = getField(fieldDescription.id);
    const value = ($input.val() || '').trim();
    if (!value) {
        // Association is not set or was deleted, just
        return;
    }
    const url = fieldDescription.routes.show.replace('__OBJECT_ID__', value);
    showActionDialog(action)
        .then(() => $.ajax(url, {dataType: 'html'}))
        .done(html => {
            populateActionDialog(action, html);
            // This is the show action, do we want people to do anything else ?
            action.dialog.body
                .on('click', 'a', e => e.preventDefault())
                .on('submit', 'form', e => e.preventDefault());
        })
        .fail(handleActionRequestError(action))
    ;
}

//
// Bootstrap listeners
// ---------------------------------------------------------------------------------------------------------------


$(document)
    // Show button
    .on('click.sonata-admin', '.sonata-ba-action[data-field-action="show-association"]', event => {
        event.preventDefault();
        const $link = $(event.currentTarget);
        const fieldDescription = getFieldDescription($link);
        const dialog = createActionDialog(fieldDescription);
        showShowDialog(createFieldAction(fieldDescription, dialog));
    })
    // List button
    .on('click.sonata-admin', '.sonata-ba-action[data-field-action="list-association"]', event => {
        event.preventDefault();
        const $link = $(event.currentTarget);
        const fieldDescription = getFieldDescription($link);
        const dialog = createActionDialog(fieldDescription);
        showListDialog($link.attr('href'), createFieldAction(fieldDescription, dialog));
    })
    // Create button
    .on('click.sonata-admin', '.sonata-ba-action[data-field-action="create-association"]', event => {
        event.preventDefault();
        const $link = $(event.currentTarget);
        const fieldDescription = getFieldDescription($link);
        const dialog = createActionDialog(fieldDescription);
        showCreateDialog($link.attr('href'), createFieldAction(fieldDescription, dialog));
    })
    // Delete button
    .on('click.sonata-admin', '.sonata-ba-action[data-field-action="remove-association"]', event => {
        event.preventDefault();
        const $link = $(event.currentTarget);
        const fieldDescription = getFieldDescription($link);
        const $field = getField(fieldDescription.id);
        if (!$field.val()) {
            return;
        }
        // if field is a select input, unselect all
        if (containsOption($field)) {
            $field.attr('selectedIndex', '-1').children('option:selected').attr('selected', false);
        }
        updateShortObjectDescription(fieldDescription, '');
    })
;
