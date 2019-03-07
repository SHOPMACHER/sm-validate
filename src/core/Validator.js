import debounce from 'lodash.debounce';

import * as validators from '../validators';
import * as triggers from './triggers';

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
            validateErrorElement,
            validateHidden
        } = this.$ref.dataset;

        this.options = {
            empty: {
                message: validateEmptyMessage
            },
            trigger: {
                debounce: validateDebounce ? parseInt(validateDebounce, 10) : 300
            },
            invalidMessage: validateInvalidMessage,
            messageCount: validateMessageCount,
            hidden: validateHidden !== undefined ? validateHidden === 'true' : true,
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

        if (!value && !message) {
            return;
        }

        this.activeValidators.push(validator.create(this.$ref, { value, message }));
    };

    validate = (event, trigger = triggers.CHANGE) => new Promise(resolve => {
        if (!this.options.hidden && this.$ref.offsetParent === null) {
            this.$ref.classList.remove('sm-validate-error');
            return resolve(true);
        }

        let validations$ = this.activeValidators.reduce((result, validator) => {
            const message = validator.message || this.options.invalidMessage;

            if (validator[trigger] === false) {
                return result;
            }

            const isValid = validator.isValid();
            const resolver = new Promise(resolve => {
                if (isValid instanceof Promise) {
                    return isValid.then(v => resolve({
                        isValid: v,
                        message,
                    }));
                }

                return resolve({
                    isValid,
                    message,
                })
            });

            return result.concat(resolver);
        }, []);

        return Promise.all(validations$).then(validations => {
            let messages = validations.reduce((messages, validation) => {
                const { isValid, message } = validation;

                return !isValid && messages.indexOf(message) === -1 && !!message
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

            return resolve(isValid);
        });
    });

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
            event.preventDefault();
            const result$ = validators.map(validator => validator.validate(event, triggers.SUBMIT));

            Promise.all(result$).then(result => {
                if (result.some(isValid => !isValid)) {
                    return;
                }

                $form.dispatchEvent(new CustomEvent('smValidate', {
                    detail: {
                        isValid: true
                    }
                }));

                $form.submit();
            });
        });
    }
}
