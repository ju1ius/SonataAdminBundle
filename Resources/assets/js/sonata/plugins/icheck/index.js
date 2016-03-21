import $ from 'jquery';

import './icheck.css';


/**
 * @constant
 * @type {string}
 */
const ICHECK_SELECTOR = [
    ':not(label.btn) input[type="checkbox"]',
    ':not(label.btn) input[type="radio"]'
].join(',');

/**
 * @constant
 * @type {string}
 */
const CHECKBOX_CSS_CLASS = 'icheckbox_square-blue';

/**
 * @constant
 * @type {string}
 */
const RADIO_CSS_CLASS = 'iradio_square-blue';


export default subject => $(subject)
    .find(ICHECK_SELECTOR)
    .iCheck({
        checkboxClass: CHECKBOX_CSS_CLASS,
        radioClass: RADIO_CSS_CLASS
    })
;
