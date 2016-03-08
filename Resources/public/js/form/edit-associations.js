;(function ($, Sonata) {
    "use strict";

    /**
     * @constant
     * @type {string}
     */
    var EDIT_MODE_LIST = 'list';

    var Admin = Sonata.Admin;

    var getField = Admin.getField;
    var getAssociationFieldContainer = Admin.getAssociationFieldContainer;
    var getAssociationFieldWidget = Admin.getAssociationFieldWidget;
    var getParentListField = Admin.getParentListField;

    var triggerEvent = Admin.triggerEvent;
    var triggerEventAsync = Admin.triggerEventAsync;

    var createSpinner = Admin.createSpinner;
    var createAlert = Admin.createAlert;
    var createAlertOverlay = Admin.createAlertOverlay;

    //
    // Type definitions
    //-----------------------------------------------------------------------------------------------------------------

    /**
     * Field description passed by the Sonata admin templates.
     * This object must be generated by calling the twig function: `sonata_field_description_json`
     * in the form template block.
     *
     * @typedef {{
     *   id: string,
     *   label: string,
     *   editMode: string,
     *   formType: string,
     *   admin: string,
     *   associationAdmin: string,
     *   routes: {
     *      shortObjectDescription: string,
     *      retrieveFormElement: string,
     *      appendFormElement: string,
     *   }
     * }} FieldDescriptionType
     */

    /**
     * @typedef {{
     *   root: jQuery,
     *   title: jQuery,
     *   body: jQuery,
     *   spinner: jQuery
     * }} DialogType
     */

    /**
     * @typedef {{
     *   fieldDescription: FieldDescriptionType,
     *   dialog: ?DialogType
     * }} FieldActionType
     */

    //
    // Utilities
    //-----------------------------------------------------------------------------------------------------------------

    function merge () {
        return $.extend.apply(null, [].concat.apply([true, {}], arguments));
    }

    /**
     * Returns whether the given element is an anchor inside the same page.
     *
     * @param {jQuery} $el
     * @returns {boolean}
     */
    function isAnchor ($el) {
        var href = $el.attr('href');
        return $el.is('a') && (!href || href[0] === '#');
    }

    /**
     * Retrieves the form field description from a DOM Element.
     * The field description must be passed to the element as a serialized JSON object,
     * via a [data-field-description] attribute.
     * The JSON object must conform to the {FieldDescriptionType} definition.
     *
     * @param {jQuery} $element
     * @returns {FieldDescriptionType}
     */
    function getFieldDescription ($element) {
        var fieldDescription = $element.data('fieldDescription');
        fieldDescription.actionType = $element.data('fieldAction');
        return fieldDescription;
    }

    // ==================== Former edit_many_association_script.html.twig ==================== //

    //
    // Dialog
    //-----------------------------------------------------------------------------------------------------------------

    var DIALOG_TEMPLATE =
        '<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
            '<div class="modal-dialog modal-lg">' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<button class="close" data-dismiss="modal" aria-hidden="true" aria-label="Close">' +
                            '<i class="fa fa-close"></i>' +
                        '</button>' +
                        '<h4 class="modal-title"></h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="modal-body-content"></div>' +
                        '<div class="overlay spinner-overlay text-primary"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    ;

    /**
     * Creates the modal dialog DOM.
     *
     * @param {string} id The id of the modal dialog.
     * @param {string} title
     * @param {?string} loadingMessage
     *
     * @returns {DialogType}
     */
    function createDialog (id, title, loadingMessage) {
        var $modal = $(DIALOG_TEMPLATE).attr('id', 'field_dialog_' + id);
        return {
            root: $modal.attr('aria-labelledby', 'field_dialog_title_' + id),
            title: $modal.find('.modal-title').attr('id', 'field_dialog_title_' + id).text(title),
            body: $modal.find('.modal-body-content'),
            spinner: $modal.find('.overlay').append(createSpinner(64, loadingMessage))
        };
    }

    /**
     * Returns a new modal dialog from a FieldDescriptionType,
     * and injects it into the document.
     *
     * @param {FieldDescriptionType} fieldDescription
     * @returns {DialogType}
     */
    function createActionDialog (fieldDescription) {
        var dialog = createDialog(fieldDescription.id, fieldDescription.label, Sonata.i18n.loadingInformation);
        $(document.body).append(dialog.root);
        return dialog;
    }

    /**
     * Returns a FieldActionType object.
     *
     * @param {FieldDescriptionType} fieldDescription
     * @param {?DialogType} dialog
     * @returns {FieldActionType}
     */
    function createFieldAction (fieldDescription, dialog) {
        return {
            fieldDescription: fieldDescription,
            dialog: dialog
        };
    }

    /**
     * @param {FieldActionType} action
     * @returns {jQuery.Deferred}
     */
    function showActionDialog (action) {
        return $.Deferred(function (promise) {
            action.dialog.root.one('shown.bs.modal', function () {
                promise.resolve(action);
            }).modal();
        });
    }

    /**
     * @param {FieldActionType} action
     * @returns {jQuery.Deferred}
     */
    function closeActionDialog (action) {
        return $.Deferred(function (promise) {
            action.dialog.root.one('hidden.bs.modal', function () {
                action.dialog.root.remove();
                promise.resolve(action);
            }).modal('hide');
        });
    }

    /**
     * @param {FieldActionType} action
     * @param {string} html
     */
    function populateActionDialog (action, html) {
        action.dialog.body.html(html);
        action.dialog.body.trigger('sonata:domready');
    }

    /**
     * @param {FieldActionType} action
     */
    function showDialogSpinner (action) {
        action.dialog.spinner.fadeIn(100);
    }

    /**
     * @param {FieldActionType} action
     */
    function hideDialogSpinner (action) {
        action.dialog.spinner.fadeOut(100);
    }

    /**
     * Wrapper around the jQuery.ajaxSubmit plugin to return a jQuery.Deferred, like $.ajax.
     *
     * @param {jQuery} $form
     * @param {Object} options
     * @returns {jQuery.Deferred}
     */
    function ajaxSubmit ($form, options) {
        return $.Deferred(function (promise) {
            $form.ajaxSubmit(merge(options, {
                data: {_xml_http_request: true},
                success: promise.resolve.bind(promise),
                error: promise.reject.bind(promise)
            }));
        });
    }

    /**
     * Called when a request triggered by a field action fails.
     *
     * @param {FieldActionType} action
     * @param {jqXHR} xhr
     */
    function handleActionRequestError (action, xhr) {
        populateActionDialog(action, xhr.responseText);
        hideDialogSpinner(action);
    }

    /**
     * Fetches the related object short description.
     *
     * @param {FieldDescriptionType} fieldDescription
     * @param {string} objectId
     *
     * @fires sonata:association-update
     * @fires sonata:association-updated
     */
    function updateShortObjectDescription (fieldDescription, objectId) {
        var fieldId = fieldDescription.id;
        var $field = getField(fieldId);
        var eventData = merge(fieldDescription, {objectId: objectId});

        return triggerEvent('sonata:association-update', $field, eventData).then(function (event) {
            $field.val(objectId);
            getAssociationFieldWidget(fieldId).addClass('loading').empty().append(Admin.createSpinner());
            return $.ajax({
                url: fieldDescription.routes.shortObjectDescription.replace('__OBJECT_ID__', objectId),
                dataType: 'html'
            }).done(function (html) {
                var $widget = getAssociationFieldWidget(fieldId);
                $widget.removeClass('loading').html(html);
                triggerEventAsync('sonata:association-updated', $widget, eventData);
            }).fail(function (response) {
                getAssociationFieldWidget(fieldId).removeClass('loading').empty().append(
                    $('<span class="inner-field-short-description text-danger"/>').text(response.statusText)
                )
            });
        });
    }

    /**
     *
     * @param {FieldDescriptionType} fieldDescription
     * @param {string} objectId
     *
     * @fires sonata:association-add
     * @fires sonata:association-added
     */
    function retrieveFormElement (fieldDescription, objectId) {
        var fieldId = fieldDescription.id;
        var $widget = getAssociationFieldWidget(fieldId);
        var $form = $widget.closest('form');
        var eventData = merge(fieldDescription, {objectId: objectId});

        return triggerEvent('sonata:association-add', $widget, eventData).then(function (event) {
            return ajaxSubmit($form, {
                url: fieldDescription.routes.retrieveFormElement,
                method: 'post',
                dataType: 'html'
            }).done(function (html) {
                getAssociationFieldContainer(fieldId, $form).replaceWith(html);
                var $field = getField(fieldId, $form);
                var $newElement = $field.find('[value="' + objectId + '"]');
                if ($newElement.is('input')) {
                    $newElement.attr('checked', 'checked');
                } else {
                    $newElement.attr('selected', 'selected');
                }
                getAssociationFieldContainer(fieldId, $form).trigger('sonata:domready');
                triggerEventAsync('sonata:association-added', $field, eventData);
            }).fail(function (response) {
                getAssociationFieldContainer(fieldId).closest('.box').append(
                    createAlertOverlay(response.statusText)
                );
            });
        });

    }

    /**
     * Appends a new association field to a sonata_type_collection
     *
     * @param {FieldDescriptionType} fieldDescription
     *
     * @fires sonata:collection-item-add
     * @fires sonata:collection-item-added
     */
    function appendFormElement (fieldDescription) {
        var $fieldContainer = getAssociationFieldContainer(fieldDescription.id);
        var $form = $fieldContainer.closest('form');
        var eventData = merge(fieldDescription);

        triggerEvent('sonata:collection-item-add', $fieldContainer, eventData).then(function () {
            var $spinner = Admin.createSpinnerOverlay(32).appendTo($fieldContainer.closest('.box'));
            return ajaxSubmit($form, {
                url: fieldDescription.routes.appendFormElement,
                method: 'post',
                dataType: 'html'
            }).done(function (html) {
                $fieldContainer.replaceWith(html);
                $spinner.remove();
                var $newContainer = getAssociationFieldContainer(fieldDescription.id);
                $newContainer.trigger('sonata:domready');
                if ($form.find('input[type="file"]').length) {
                    $form.attr('enctype', 'multipart/form-data');
                    $form.attr('encoding', 'multipart/form-data');
                }
                triggerEventAsync('sonata:collection-item-added', $newContainer, eventData);
            }).fail(function (xhr) {
                $spinner.empty().css({cursor: 'pointer'}).one('click', function () {
                    $spinner.remove();
                }).append(createAlert(xhr.statusText));
            });
        });
    }

    /**
     * handle link click in a list :
     *  - if the parent has an objectId defined then the related input gets updated
     *  - if the parent has NO objectId then an ajax request is made to continue normal navigation.
     *
     * @param event
     *
     * @fires sonata:association-update
     * @fires sonata:association-updated
     */
    function handleListDialogClick (event) {
        var $link = $(this);
        var action = event.data;
        if (isAnchor($link)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        var $parentListField = getParentListField($link, action.dialog.root);
        if (!$parentListField.length) {
            // the user does not click on a row column, continue normal navigation (i.e. filters, etc...)
            showDialogSpinner(action);
            return $.ajax({
                url: $link.attr('href'),
                dataType: 'html'
            }).done(function (html) {
                populateActionDialog(action, html);
                hideDialogSpinner(action);
            }).fail(handleActionRequestError.bind(null, action));
        }

        return updateShortObjectDescription(action.fieldDescription, $parentListField.attr('objectId'))
            .always(function () {
                closeActionDialog(action);
            })
        ;
    }

    /**
     * Handle form submissions in list dialog, and continue navigation.
     *
     * @param event
     */
    function handleListDialogSubmit (event) {
        event.preventDefault();
        var action = event.data;
        var $form = $(this);
        showDialogSpinner(action);
        ajaxSubmit($form, {
            method: $form.attr('method'),
            url: $form.attr('action'),
            dataType: 'html'
        }).done(function (html) {
            hideDialogSpinner(action);
            populateActionDialog(action, html);
        }).fail(handleActionRequestError.bind(null, action));
    }

    /**
     * Handle navigation in the create dialog.
     *
     * @param event
     */
    function handleCreateDialogClick (event) {
        var $target = $(this);
        var action = event.data;

        // a click on a tab, a sonata action, etc...
        if (isAnchor($target) || $target.hasClass('sonata-ba-action')) {
            return;
        }
        event.preventDefault();

        showDialogSpinner(action);
        ajaxSubmit($target, {
            url: $target.attr('href'),
            method: 'get'
        }).done(function (data) {
            hideDialogSpinner(action);
            populateActionDialog(action, data);
        }).fail(handleActionRequestError.bind(null, action));
    }

    /**
     * Handle form submissions in the create dialog.
     *
     * @param event
     *
     * @fires sonata:submit
     */
    function handleCreateDialogSubmit (event) {
        var $form = $(this);
        var action = event.data;

        event.preventDefault();
        triggerEvent('sonata:submit', $form).then(function () {
            showDialogSpinner(action);
            ajaxSubmit($form, {
                url: $form.attr('action'),
                method: $form.attr('method')
            }).done(function (data) {
                hideDialogSpinner(action);
                // if the crud action return ok, then the element has been added
                // so the widget container must be refresh with the last option available
                if (data.result !== 'ok') {
                    populateActionDialog(action, data);
                    return;
                }
                closeActionDialog(action).then(function (action) {
                    var fieldDescription = action.fieldDescription;
                    if (fieldDescription.editMode === EDIT_MODE_LIST) {
                        // in this case we update the hidden input,
                        // and call the change event to retrieve the post information
                        return updateShortObjectDescription(fieldDescription, data.objectId);
                    }
                    return retrieveFormElement(fieldDescription, data.objectId);
                });
            }).fail(handleActionRequestError.bind(null, action));
        });
    }

    /**
     * Shows the dialog to choose an association from a list view.
     *
     * @param {string} url
     * @param {FieldActionType} action
     */
    function showListDialog (url, action) {
        showActionDialog(action).then(function () {
            return $.ajax(url, {dataType: 'html'});
        }).done(function (html) {
            populateActionDialog(action, html);
            // setup event listeners on the modal, passing our action
            action.dialog.root
                .on('click', 'a', action, handleListDialogClick)
                .on('submit', 'form', action, handleListDialogSubmit);
            hideDialogSpinner(action);
        }).fail(handleActionRequestError.bind(null, action));
    }

    /**
     * Shows the dialog to create a new association.
     *
     * @param {string} url
     * @param {FieldActionType} action
     */
    function showCreateDialog (url, action) {
        showActionDialog(action).then(function () {
            return $.ajax(url, {dataType: 'html'});
        }).done(function (html) {
            populateActionDialog(action, html);
            // setup event listeners on the modal, passing our action
            // note that jQuery submit events DO bubble
            action.dialog.root
                .on('click', 'a', action, handleCreateDialogClick)
                .on('submit', 'form', action, handleCreateDialogSubmit);
            hideDialogSpinner(action);
        }).fail(handleActionRequestError.bind(null, action));;
    }

    //
    // Bootstrap listeners
    // ---------------------------------------------------------------------------------------------------------------

    // List button
    $(document).on('click.sonata-admin', '.sonata-ba-action[data-field-action="list-association"]', function (event) {
        event.preventDefault();
        var $link = $(this);
        var fieldDescription = getFieldDescription($link);
        var dialog = createActionDialog(fieldDescription);
        showListDialog($link.attr('href'), createFieldAction(fieldDescription, dialog));
    });

    // Create button
    $(document).on('click.sonata-admin', '.sonata-ba-action[data-field-action="create-association"]', function (event) {
        event.preventDefault();
        var $link = $(this);
        var fieldDescription = getFieldDescription($link);
        var dialog = createActionDialog(fieldDescription);
        showCreateDialog($link.attr('href'), createFieldAction(fieldDescription, dialog));
    });

    // Delete button
    $(document).on('click.sonata-admin', '.sonata-ba-action[data-field-action="remove-association"]', function (event) {
        event.preventDefault();
        var $link = $(this);
        var fieldDescription = getFieldDescription($link);
        var $field = getField(fieldDescription.id);
        if (!$field.val()) {
            return;
        }
        // if field is a select input, unselect all
        if ($field.find('option').get(0)) {
            $field.attr('selectedIndex', '-1').children("option:selected").attr("selected", false);
        }
        updateShortObjectDescription(fieldDescription, '');
    });

    // Used in: edit_orm_one_to_many, edit_orm_many_to_many
    $(document).on('click.sonata-admin', '.sonata-ba-action[data-field-action="append-form-element"]', function (event) {
        event.preventDefault();
        var fieldDescription = getFieldDescription($(this));
        appendFormElement(fieldDescription);
    });

}(this.jQuery, this.Sonata));