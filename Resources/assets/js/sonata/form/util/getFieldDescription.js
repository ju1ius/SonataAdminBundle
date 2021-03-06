// Field description passed by the Sonata admin templates.
// This object must be generated by calling the twig function: `sonata_field_description_json`
// in the form template block.

/**
 * An object describing a form association field.
 *
 * @public
 * @typedef {object} FieldDescriptionType
 * @property {string} id
 * @property {string} label
 * @property {string} editMode "standard" for sonata_type_model, "list" for sonata_type_model_list
 * @property {string} formType The form type, e.g. sonata_type_collection etc.
 * @property {string} admin The root admin code
 * @property {string} associationAdmin The associated admin code
 * @property {object} routes
 * @property {string} routes.shortObjectDescription
 * @property {string} routes.retrieveFormElement
 * @property {string} routes.appendFormElement
 */


/**
 * Retrieves the form field description from a DOM Element.
 * The field description must be passed to the element as a serialized JSON object,
 * via a [data-field-description] attribute.
 * The JSON object must conform to the {FieldDescriptionType} definition.
 *
 * @param {jQuery} $element
 * @returns {FieldDescriptionType}
 */
export default $element => ({
    ...$element.data('fieldDescription'),
    actionType: $element.data('fieldAction')
});
