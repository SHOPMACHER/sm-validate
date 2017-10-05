export default ($input, { value, message }) => ({
    isValid: () => {
        const inputValue = $input.value;

        switch (value) {
            case 'number':
                const number = parseInt(inputValue, 10);
                return typeof number === 'number' && !isNaN(number);
            case 'text':
                return typeof inputValue === 'string';
            default:
                return false;
        }
    },
    message
});
