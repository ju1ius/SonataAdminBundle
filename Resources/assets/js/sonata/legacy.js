import $ from 'jquery';

import curry from 'sonata/util/curry';
import setupStickyElements from 'sonata/plugins/sticky';
import setupICheck from 'sonata/plugins/icheck';
import {setupSelect2, setupSortableSelect2} from 'sonata/plugins/select2';
import setupTreeViews from 'sonata/plugins/treeview';
import setupXEditable from 'sonata/plugins/xeditable';


// Legacy code, do not require jsdoc
/* eslint-disable valid-jsdoc */


//
// Formerly Admin.set_object_field_value()
// This seems to be the legacy xeditable implementation, and is not currently used anywhere, AFAICT.
// In this case, it should be removed
// ---------------------------------------------------------------------------------------------------------------

function setObjectFieldValue ($subject) {
    $.ajax({
        url: $subject.attr('href'),
        method: 'post',
        dataType: 'json'
    }).done(json => {
        const $parent = $subject.parent();
        if (json.status === 'OK') {
            $parent.html(json.content);
            $parent.effect('highlight', {color: '#57A957'}, 2000);
        } else {
            $parent.effect('highlight', {color: '#C43C35'}, 2000);
        }
    });
}

$(document).on('click', 'a.sonata-ba-edit-inline', event => {
    event.preventDefault();
    setObjectFieldValue($(event.currentTarget));
});


//
// Deprecated Admin API
// ----------------------------------------------------------------------------------------------------------------

const noop = () => {};

function warnOnce (message, fn) {
    let warned = false;
    return (...args) => {
        if (!warned) {
            warned = true;
            console.warn(message);
        }
        fn(...args);
    };
}

const deprecate = curry((version, removed, name, message = '', fn = noop) => {
    message = `${name} was deprecated in version ${version}, and will be removed in ${removed}. ${message}`;
    return warnOnce(message, fn);
});

const deprecate24 = deprecate('2.4', '3.0');


export const shared_setup = deprecate24(
    'Admin.shared_setup()',
    'Please trigger the "sonata:domready" event on the node you want initialized.',
    subject => $(subject).trigger('sonata:domready')
);

export const setup_list_modal = deprecate24(
    'Admin.setup_list_modal()',
    'Please style your dialog with CSS.'
);

export const setup_select2 = deprecate24(
    'Admin.setup_select2()',
    'Please trigger a "sonata:domready" event instead.',
    subject => setupSelect2($(subject))
);

export const setup_sortable_select2 = deprecate24(
    'Admin.setup_sortable_select2()',
    'Please trigger the "sonata:domready" event instead.',
    subject => setupSortableSelect2($(subject))
);

export const setup_icheck = deprecate24(
    'Admin.setup_icheck()',
    'Please trigger a "sonata:domready" event instead.',
    subject => setupICheck($(subject))
);

export const setup_xeditable = deprecate24(
    'Admin.setup_xeditable()',
    'Please trigger a "sonata:domready" event instead.',
    subject => setupXEditable($(subject))
);

export const setup_tree_view = deprecate24(
    'Admin.setup_tree_view()',
    'Please trigger a "sonata:domready" event instead.',
    subject => setupTreeViews($(subject))
);

export const setup_sticky_elements = deprecate24(
    'Admin.setup_sticky_elements()',
    'Please use the select2 plugin directly.',
    subject => setupStickyElements($(subject))
);

export const setup_form_tabs_for_errors = deprecate24(
    'Admin.setup_form_tabs_for_errors()'
);

export const show_form_first_tab_with_errors = deprecate24(
    'Admin.show_form_first_tab_with_errors()'
);

export const setup_collection_counter = deprecate24(
    'Admin.setup_collection_counter()',
    'Please trigger a "sonata:domready" event instead.'
);

export const add_pretty_errors = deprecate24(
    'Admin.add_pretty_errors()'
);

export const log = deprecate24(
    'Admin.setup_inline_form_errors()',
    'Please use the console API directly.'
);

export const set_object_field_value = deprecate24(
    'Admin.set_object_field_value()'
);
