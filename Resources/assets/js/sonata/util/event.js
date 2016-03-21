import $ from 'jquery';

//
// Event helpers
// ------------------------------------------------------------------------------------------------------------

/**
 * Triggers an event on the specified target and returns a promise of that event.
 * If event.preventDefault() is called by a handler, the promise will reject.
 * Otherwise, the promise will resolve.
 *
 * @param {string} name The event name
 * @param {jQuery|HTMLElement} [target] (or document if undefined)
 * @param {array|object} [args] Custom arguments to pass to the handlers.
 *
 * @returns {jQuery.Deferred<jQuery.Event>}
 */
export function triggerCancelableEvent (name, target = document, args = []) {
    const event = $.Event(name);
    return $.Deferred(({resolve, reject}) => {
        $(target).trigger(event, args);
        if (event.isDefaultPrevented()) {
            reject(event);
        } else {
            resolve(event);
        }
    });
}

/**
 * Returns a promise of a jQuery event, to be fired on the next animation frame.
 *
 * @param {string} name The event name
 * @param {jQuery|HTMLElement} [target] (or document if undefined)
 * @param {array|object} [args] Custom arguments to pass to the handlers.
 *
 * @returns {jQuery.Deferred<jQuery.Event>}
 */
export function triggerAsyncEvent (name, target = document, args = []) {
    const event = $.Event(name);
    return $.Deferred(({resolve}) => {
        requestAnimationFrame(() => {
            $(target).trigger(event, args);
            resolve(event);
        });
    });
}
