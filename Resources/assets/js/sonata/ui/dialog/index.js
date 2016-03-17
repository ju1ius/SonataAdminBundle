import $ from 'jquery';

import {createSpinner} from 'sonata/ui/spinner';
import SKELETON from './dialog.html';
import './dialog.css';


export default class Dialog
{
    constructor (title) {
        const id = Date.now();
        this.$root = $(SKELETON)
            .attr('id', `dialog_${id}`)
            .attr('aria-labelledby', `dialog_title_${id}`)
        ;
        this.$title = this.$root.find('.modal-title')
            .attr('id', `dialog_title_${id}`)
            .text(title)
        ;
        this.$body = this.$root.find('.modal-body-content');
        this.$spinner = this.$root.find('.overlay')
            .append(createSpinner(64))
        ;
    }

    /**
     * @property {jQuery} The dialog's body.
     */
    get body () {
        return this.$body;
    }

    appendTo (element) {
        this.$root.appendTo(element);

        return this;
    }

    /**
     * Sets the contents of the dialog's body.
     *
     * @param {string} content
     * @returns {jQuery.Deferred.<Dialog>}
     * @fires sonata:domready
     */
    setContent (content) {
        this.$body.html(content);
        this.$body.trigger('sonata:domready');

        return this.hideSpinner();
    }

    /**
     * Open the dialog.
     * Will be removed automatically from the DOM when closed.
     *
     * @returns {jQuery.Deferred.<Dialog>}
     */
    open () {
        return $.Deferred(({resolve}) => {
            this.$spinner.show();
            this.$root
                .one('shown.bs.modal', () => resolve(this))
                .one('hidden.bs.modal', () => this.$root.remove())
                .modal();
        });
    }

    /**
     * Close the dialog and remove it from the DOM.
     *
     * @returns {jQuery.Deferred.<Dialog>}
     */
    close () {
        return $.Deferred(({resolve}) => {
            this.$root.one('hidden.bs.modal', () => {
                this.$root.remove();
                resolve(this);
            }).modal('hide');
        });
    }

    /**
     * Shows the spinner overlay.
     *
     * @returns {jQuery.Deferred.<Dialog>}
     */
    showSpinner () {
        return this.$spinner.fadeIn(100).promise().then(() => this);
    }

    /**
     * Hides the spinner overlay.
     *
     * @returns {jQuery.Deferred.<Dialog>}
     */
    hideSpinner () {
        return this.$spinner.fadeOut(100).promise().then(() => this);
    }
}
