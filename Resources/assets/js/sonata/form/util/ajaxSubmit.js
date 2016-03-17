import $ from 'jquery';

import merge from 'sonata/util/merge';


/**
 * Wrapper around the jQuery.ajaxSubmit plugin to return a jQuery.Deferred, like $.ajax.
 *
 * @param {jQuery} $form
 * @param {Object} options
 * @returns {jQuery.Deferred}
 */
export default function ajaxSubmit ($form, options) {
    return $.Deferred(promise => {
        $form.ajaxSubmit(merge({}, options, {
            data: {_xml_http_request: true},
            success: promise.resolve.bind(promise),
            error: promise.reject.bind(promise)
        }));
    });
}
