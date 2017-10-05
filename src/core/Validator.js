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
            validateMaxlength,
            validateMaxlengthMessage,
            validateType,
            validateTypeMessage,
            validateDebounce,
            validateMessageCount,
            validateErrorMessage,
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
            maxLength: {
                value: validateMaxlength,
                message: validateMaxlengthMessage
            },
            type: {
                value: validateType,
                message: validateTypeMessage
            },
            trigger: {
                debounce: validateDebounce ? parseInt(validateDebounce, 10) : 300
            },
            errorMessage: validateErrorMessage,
            messageCount: validateMessageCount
        };

        if (validateErrorElement) {
            this.$errorRef = document.querySelector(validateErrorElement);
        }

        // add validators
        this.createValidators();

        // debounce trigger
        this.validateDebounced = debounce(this.validate, this.options.trigger.debounce);
        this.$ref.addEventListener('keyup', this.validateDebounced);
        this.$ref.addEventListener('blur', this.validate);
    }

    createValidators = () => {
        const {
            minLength,
            maxLength,
            empty,
            type
        } = this.options;

        if (empty.message) {
            this.activeValidators.push(validators.empty(this.$ref, empty));
        }

        if (minLength && minLength.value) {
            this.activeValidators.push(validators.minLength(this.$ref, minLength));
        }

        if (maxLength && maxLength.value) {
            this.activeValidators.push(validators.maxLength(this.$ref, maxLength));
        }

        if (type && type.value) {
            this.activeValidators.push(validators.dataType(this.$ref, type));
        }
    };

    validate = () => {
        const messages = this.activeValidators.reduce((messages, validator) => {
            return !validator.isValid()
                ? messages.concat(validator.message || this.options.errorMessage)
                : messages;
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
