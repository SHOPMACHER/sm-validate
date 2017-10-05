import debounce from 'lodash.debounce';

import * as validators from '../validators';

export default class Validator {

    $ref = null;
    $errorRef = null;
    options = {};
    activeValidators = [];

    constructor($ref) {
        this.$ref = $ref;

        if (!this.$ref) {
            throw new Error('Validator needs an element reference, to be initialized.');
        }

        const {
            validateEmptyMessage,
            validateMinlength,
            validateMinlengthMessage,
            validateDebounce,
            validateMessageCount,
            validateErrorElement
        } = this.$ref.dataset;

        this.options = {
            empty: {
                message: validateEmptyMessage
            },
            minLength: {
                value: validateMinlength,
                message: validateMinlengthMessage
            },
            trigger: {
                debounce: parseInt(validateDebounce, 10)
            },
            messageCount: validateMessageCount
        };

        if (validateErrorElement) {
            this.$errorRef = document.querySelector(validateErrorElement);
        }

        // add validators
        this.createValidators();

        // debounce trigger
        if (this.options.trigger.debounce) {
            this.validate = debounce(this.validate, this.options.trigger.debounce);
            this.$ref.addEventListener('keyup', this.validate);
        }
    }

    createValidators = () => {
        const {
            minLength,
            empty
        } = this.options;

        if (empty.message) {
            this.activeValidators.push(validators.empty(this.$ref, empty));
        }

        if (minLength && minLength.value) {
            this.activeValidators.push(validators.minLength(this.$ref, minLength));
        }
    };

    validate = () => {
        const messages = this.activeValidators.reduce((messages, validator) => {
            return !validator.isValid() ? messages.concat(validator.message) : messages;
        }, []);

        if (messages.length) {
            this.$ref.classList.add('sm-validate-error');
        } else {
            this.$ref.classList.remove('sm-validate-error');
        }

        if (this.$errorRef) {
            this.$errorRef.innerHTML = `<div>${messages.join('</div><div>')}</div>`;
        }
    };

    /**
     * Intializes all inputs having the `data-sm-validate` attribute set to `true`.
     *
     * @static
     *
     * @returns {*}
     */
    static init() {
        const $inputs = document.querySelectorAll('[data-validate="true"]');
        return Array.prototype.map.call($inputs, $input => new Validator($input));
    }

}
