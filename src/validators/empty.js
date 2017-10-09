export default {
    attr: 'empty',
    create: ($input, { value, message }) => ({
        isValid: () => $input.value.length > 0,
        message
    })
};
