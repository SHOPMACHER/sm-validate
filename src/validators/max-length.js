export default {
    attr: 'maxlength',
    create: ($input, { value, message }) => ({
        isValid: () => $input.value.length < value,
        message
    })
};
