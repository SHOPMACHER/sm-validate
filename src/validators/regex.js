export default ($input, { value, message }) => ({
    isValid: () =>  new RegExp(value).test($input.value),
    message
});
