export default {
    attr: 'minlength',
    create: ($input, { value, message }) => ({
        isValid: () => $input.value.length >= value,
        message
    })
};
