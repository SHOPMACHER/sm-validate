export default ($input, { value, message }) => ({
    isValid: () =>  $input.value.length === 0 || new RegExp(value).test($input.value),
    message
});
