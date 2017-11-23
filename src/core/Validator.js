import debounce from 'lodash.debounce';

import * as validators from '../validators';

export default class Validator {

    $ref = null;
    $errorRef = null;
    options = {};
    activeValidators = [];

    constructor($ref, customValidators = []) {
        this.$ref = $ref;

        if (!this.$ref) {
            throw new Error('Validator needs an element reference, to be initialized.');
        }

        const {
            validateEmptyMessage,
            validateDebounce,
            validateMessageCount,
            validateInvalidMessage,
            validateErrorElement
        } = this.$ref.dataset;

        this.options = {
            empty: {
                message: validateEmptyMessage
            },
            trigger: {
                debounce: validateDebounce ? parseInt(validateDebounce, 10) : 300
            },
            invalidMessage: validateInvalidMessage,
            messageCount: validateMessageCount
        };

        if (validateErrorElement) {
            this.$errorRef = document.querySelector(validateErrorElement);
        }

        // add validators
        Object.keys(validators).forEach(name => {
            const validator = validators[name];

            if (!validator.attr) {
                return;
            }

            this.register(validator);
        });

        // add custom validators
        customValidators.forEach(this.register);

        // debounce trigger
        this.validateDebounced = debounce(this.validate, this.options.trigger.debounce);

        switch (this.$ref.type) {
            case 'checkbox':
                this.$ref.addEventListener('change', this.validate);
                break;
            default:
                this.$ref.addEventListener('keyup', this.validateDebounced);
                this.$ref.addEventListener('blur', this.validate);
        }
    }

    register = (validator) => {
        const value = this.$ref.getAttribute(`data-validate-${validator.attr}`);
        const message = this.$ref.getAttribute(`data-validate-${validator.attr}-message`);

        this.activeValidators.push(validator.create(this.$ref, { value, message }));
    };

    validate = () => {
        let messages = this.activeValidators.reduce((messages, validator) => {
            const message = validator.message || this.options.invalidMessage;

            return !validator.isValid() && !messages.indexOf(message) > -1 && !!message
                ? messages.concat(message)
                : messages;
        }, []);

        const emptyMessageIndex = messages.indexOf(this.options.empty.message);
        if (emptyMessageIndex > -1) {
            messages = [messages[emptyMessageIndex]];
        }

        const isValid = messages.length === 0;

        if (!isValid) {
            this.$ref.classList.add('sm-validate-error');
        } else {
            this.$ref.classList.remove('sm-validate-error');
        }

        if (this.$errorRef) {
            this.$errorRef.innerHTML = messages.join('<br/>');
        }

        return isValid;
    };

    /**
     * Intializes all inputs having the `data-validate` attribute set to `true`.
     *
     * @static
     *
     * @returns {*} Array of validators
     */
    static init(customValidators = [], $root = document) {
        const $inputs = $root.querySelectorAll('[data-validate="true"]');
        return Array.prototype.map.call($inputs, $input => new Validator($input, customValidators));
    }

    /**
     * Attaches an array of validators to a form and validates on submit.
     * If the validation fails, the form's submit is prevented.
     *
     * @param $form
     * @param validators
     */
    static attachToForm($form, validators) {
        $form.addEventListener('submit', (event) => {
            const result = validators.map(validator => validator.validate());
            if (result.some(isValid => !isValid)) {
                event.preventDefault();
            }
        });
    }

}
