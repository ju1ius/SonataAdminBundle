//
// Events documentation
// ----------------------------------------------------------------------------------------------------------------
// TODO: replace objectId by data-object-id
// TODO: document events data payloads


//
// sonata:domready
// --------------------------------------------------------
/**
 * Fires whenever sonata loads an html page via an AJAX request.
 * @see sonataDomReadyCallback
 *
 * @event sonata:domready
 * @type {jQuery.Event}
 * @property {jQuery} target The root element of the newly inserted DOM.
 */
/**
 * @callback sonataDomReadyCallback
 * @param {jQuery.Event} event
 */


//
// sonata:association-update(d)
// --------------------------------------------------------
/**
 * Fires before the value of an association is updated,
 * in a `sonata_type_model` or `sonata_type_model_list` form.
 *
 * @event sonata:association-update
 * @type {jQuery.Event}
 * @property {jQuery} target The form field that will be updated.
 * @see sonataAssociationUpdateCallback
 */

/**
 * Fires after the value of an association was updated,
 * in a `sonata_type_model` or `sonata_type_model_list` form.
 *
 * @event sonata:association-updated
 * @type {jQuery.Event}
 * @property {jQuery} target The form field that was updated.
 * @see sonataAssociationUpdateCallback
 */

/**
 * @callback sonataAssociationUpdateCallback
 * @param {jQuery.Event} event
 * @param {string} objectId The id of the associated object
 * @param {FieldDescriptionType} fieldDescription
 */

//
// sonata:collection-*
// --------------------------------------------------------
/**
 * Fires when a new empty row is added to a `sonata_type_collection` form.
 *
 * @event sonata:collection-item-add
 * @type {jQuery.Event}
 * @property {jQuery} target The form widget that will receive the new field.
 * @see sonataCollectionUpdateCallback
 */

/**
 * Fires when a new empty row has been added to a `sonata_type_collection` form.
 *
 * @event sonata:collection-item-added
 * @type {jQuery.Event}
 * @property {jQuery} target The field that was just added.
 * @see sonataCollectionUpdateCallback
 */
/**
 * @callback sonataCollectionUpdateCallback
 * @param {jQuery.Event} event
 * @param {FieldDescriptionType} fieldDescription
 */


//
// sonata:native-collection-*
// --------------------------------------------------------
/**
 * Fires before a new item is added to a `sonata_type_native_collection` form.
 *
 * @event sonata:native-collection-item-add
 * @type {jQuery.Event}
 * @property {jQuery} target The form widget that will receive the new item.
 * @see sonataNativeCollectionItemAddCallback
 */
/**
 * Fires after a new item was added to a `sonata_type_native_collection` form.
 *
 * @event sonata:native-collection-item-added
 * @type {jQuery.Event}
 * @property {jQuery} target The form widget that will receive the new item.
 * @see sonataNativeCollectionItemAddCallback
 */
/**
 * @callback sonataNativeCollectionItemAddCallback
 * @param {jQuery.Event} event
 * @param {jQuery} newRow The new row
 */


/**
 * Fires before a new item is removed from a `sonata_type_native_collection` form.
 *
 * @event sonata:native-collection-item-delete
 * @type {jQuery.Event}
 * @property {jQuery} target The form widget from which a row will be removed.
 * @see sonataNativeCollectionDeleteCallback
 */
/**
 * Fires after a new item was removed from a `sonata_type_native_collection` form.
 *
 * @event sonata:native-collection-item-deleted
 * @type {jQuery.Event}
 * @property {jQuery} target The form widget from which a row was removed.
 * @see sonataNativeCollectionDeleteCallback
 */
/**
 * @callback sonataNativeCollectionDeleteCallback
 * @param {jQuery.Event} event
 * @param {jQuery} row The removed row
 */

