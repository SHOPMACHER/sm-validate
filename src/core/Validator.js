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
            validateRegex,
            validateRegexMessage,
            validateChecked,
            validateCheckedMessage,
            validateDebounce,
            validateMessageCount,
            validateInvalidMessage,
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
            regex: {
                value: validateRegex,
                message: validateRegexMessage
            },
            checked: {
                value: validateChecked,
                message: validateCheckedMessage
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
        this.createValidators();

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

    createValidators = () => {
        const {
            minLength,
            maxLength,
            empty,
            type,
            regex,
            checked
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

        if (regex && regex.value) {
            this.activeValidators.push(validators.regex(this.$ref, regex));
        }

        if (checked && checked.value) {
            this.activeValidators.push(validators.checked(this.$ref, checked));
        }
    };

    validate = () => {
        let messages = this.activeValidators.reduce((messages, validator) => {
            const message = validator.message || this.options.invalidMessage;

            return !validator.isValid() && !messages.includes(message)
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
    static init() {
        const $inputs = document.querySelectorAll('[data-validate="true"]');
        return Array.prototype.map.call($inputs, $input => new Validator($input));
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
