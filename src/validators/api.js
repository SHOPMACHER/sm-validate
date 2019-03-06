export default {
    attr: 'api',
    create($input) {
        console.info('Created api validator.');

        return {
            isValid: () => new Promise(resolve => setTimeout(() => {
                resolve(true);
            }, 1000)),
            message: 'async validation failed',
        };
    },
};
