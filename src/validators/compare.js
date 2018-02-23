export default {
    attr: 'compare',
    create: ($input, { value, message }) => ({
        isValid: () => {
            const $compare = document.querySelector(value);
            if (!$compare) {
                return;
            }

            return $compare.value === $input.value;
        },
        message
    })
};
