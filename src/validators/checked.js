export default {
    attr: 'checked',
    create: ($input, { value, message }) => ({
        isValid: () => $input.checked === (value === 'true'),
        message
    })
};
