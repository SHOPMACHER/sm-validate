export default ($input, { message }) => ({
    isValid: () => $input.value.length > 0,
    message
});
