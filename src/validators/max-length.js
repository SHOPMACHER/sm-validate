export default ($input, { value, message }) => ({
    isValid: () => $input.value.length < value,
    message
});
