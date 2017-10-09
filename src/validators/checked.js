export default ($input, { value, message }) => ({
    isValid: () => $input.checked === (value === 'true'),
    message
});
