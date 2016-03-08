/*

 This file is part of the Sonata package.

 (c) Thomas Rabaix <thomas.rabaix@sonata-project.org>

 For the full copyright and license information, please view the LICENSE
 file that was distributed with this source code.

 */

;(function (window, $, Sonata, undefined) {
    'use strict';

    function debounce (fn, delay) {
        var timeoutId;
        return function debounced () {
            var context = this;
            var args = arguments;

            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                timeoutId = null;
                fn.apply(context, args);
            }, delay);
        };
    }

    //
    // Sticky elements
    // ---------------------------------------------------------------------------------------------------------------

    function setupStickyElements (subject) {
        if (!Sonata.config.useStickyForms) {
            return;
        }
        var wrapper = $(subject).find('.content-wrapper');
        var navbar  = $(wrapper).find('nav.navbar');
        var footer  = $(wrapper).find('.sonata-ba-form-actions');

        if (navbar.length) {
            new Waypoint.Sticky({
                element: navbar[0],
                offset:  50,
                handler: function (direction) {
                    if (direction == 'up') {
                        $(navbar).width('auto');
                    } else {
                        $(navbar).width($(wrapper).outerWidth());
                    }
                }
            });
        }

        if (footer.length) {
            new Waypoint({
                element: wrapper[0],
                offset: 'bottom-in-view',
                handler: function (direction) {
                    var position = $('.sonata-ba-form form > .row').outerHeight() + $(footer).outerHeight() - 2;

                    if (position < $(footer).offset().top) {
                        $(footer).removeClass('stuck');
                    }

                    if (direction == 'up') {
                        $(footer).addClass('stuck');
                    }
                }
            });
        }

        handleScroll(footer, navbar, wrapper);
    }

    function handleScroll (footer, navbar, wrapper) {
        if (footer.length && $(window).scrollTop() + $(window).height() != $(document).height()) {
            $(footer).addClass('stuck');
        }

        $(window).on('scroll', debounce(function() {
            if (footer.length && $(window).scrollTop() + $(window).height() == $(document).height()) {
                $(footer).removeClass('stuck');
            }

            if (navbar.length && $(window).scrollTop() === 0) {
                $(navbar).removeClass('stuck');
            }
        }, 250));

        $('body').on('expanded.pushMenu collapsed.pushMenu', function() {
            handleResize(footer, navbar, wrapper);
        });

        $(window).on('resize', debounce(function() {
            handleResize(footer, navbar, wrapper);
        }, 250));
    }

    function handleResize (footer, navbar, wrapper) {
        setTimeout(function() {
            if (navbar.length && $(navbar).hasClass('stuck')) {
                $(navbar).width($(wrapper).outerWidth());
            }

            if (footer.length && $(footer).hasClass('stuck')) {
                $(footer).width($(wrapper).outerWidth());
            }
        }, 350); // the animation take 0.3s to execute, so we have to take the width, just after the animation ended
    }

    $(function() {
        setupStickyElements($(document));
    });

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
        }).done(function (json) {
            var $parent = $subject.parent();
            if (json.status === "OK") {
                // fix issue with html comment ...
                $parent.html($(json.content.replace(/<!--[\s\S]*?-->/g, '')).html());
                $parent.effect('highlight', {color: '#57A957'}, 2000);
            } else {
                $parent.effect('highlight', {color: '#C43C35'}, 2000);
            }
        });
    }

    $(document).on('click', 'a.sonata-ba-edit-inline', function (event) {
        event.preventDefault();
        setObjectFieldValue($(event.target));
    });

    //
    // Deprecated Admin API
    // ----------------------------------------------------------------------------------------------------------------

    var Admin = {

        /**
         * @deprecated since version 2.4 Please use `jQuery(yourNewDOM).trigger('sonata:domready')`;
         */
        shared_setup: function(subject) {
            console.warn(
                'Admin.shared_setup() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },

        /**
         * @deprecated since version 2.4 Style your modals with CSS instead.
         */
        setup_list_modal: function () {
            console.warn(
                'Admin.setup_list_modal() was deprecated in version 2.4, ' +
                'please style your modals with CSS.'
            );
        },
        /**
         * @deprecated since version 2.4 Instead, trigger a "sonata:domready" event on the node you want initialized.
         */
        setup_select2: function () {
            console.warn(
                'Admin.setup_select2() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },
        /**
         * @deprecated since version 2.4 Instead, trigger a "sonata:domready" event on the node you want initialized.
         */
        setup_icheck: function() {
            console.warn(
                'Admin.setup_icheck() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },

        /**
         * @deprecated since version 2.4 Call the xeditable plugin directly..
         */
        setup_xeditable: function () {
            console.warn(
                'Admin.setup_xeditable() was deprecated in version 2.4, ' +
                'please use the xeditable plugin directly.'
            );
        },

        /**
         * Outputs log messages to the console (only if app.debug is true).
         *
         * @param mixed
         */
        log: function () {
            if (Sonata.debug) {
                var msg = '[Sonata.Admin] ' + Array.prototype.join.call(arguments, ', ');
                console.log(msg);
            }
        },

        /**
         * @deprecated since version 2.4 Please use `jQuery(yourNewDOM).trigger('sonata:domready')`;
         */
        add_pretty_errors: function() {
            console.warn('Admin.add_pretty_errors() was deprecated in version 2.4.');
        },

        /**
         * @deprecated since version 2.4 Please use `jQuery(yourNewDOM).trigger('sonata:domready')`;
         */
        setup_collection_counter: function () {
            console.warn(
                'Admin.setup_collection_counter() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },
        /**
         * @deprecated since version 2.4 Please use `jQuery(yourNewDOM).trigger('sonata:domready')`;
         */
        setup_form_tabs_for_errors: function () {
            console.warn(
                'Admin.setup_form_tabs_for_errors() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },
        /**
         * @deprecated since version 2.4 Please use `jQuery(yourNewDOM).trigger('sonata:domready')`;
         */
        show_form_first_tab_with_errors: function () {
            console.warn(
                'Admin.setup_form_tabs_for_errors() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },

        setup_inline_form_errors: function(subject) {
        },
        /**
         * @deprecated since version 2.4 Please use `jQuery(yourNewDOM).trigger('sonata:domready')`;
         */
        setup_tree_view: function() {
            console.warn(
                'Admin.setup_tree_view() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },

        /**
         * @deprecated since version 2.4 Please use `jQuery(yourNewDOM).trigger('sonata:domready')`;
         */
        setup_sortable_select2: function() {
            console.warn(
                'Admin.setup_tree_view() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
        },
        /**
         * @deprecated since version 2.4 Sticky elements should not be initialized on modal windows.
         */
        setup_sticky_elements: function(subject) {
            console.warn(
                'Admin.setup_sticky_elements() was deprecated in version 2.4, ' +
                'please trigger a "sonata:domready" event on the node you want initialized.'
            );
            setupStickyElements($(subject));
        }
    };

    $.extend(Sonata.Admin, Admin);

}(this, this.jQuery, this.Sonata/*, undefined */));
