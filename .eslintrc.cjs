/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        'prettier/prettier': ['warn']
    },
    env: {
        browser: true,
        node: true
    },
    root: true,
    ignorePatterns: ['js/**/*', '*.env'],
    globals: {
        API: 'readonly',
        $: 'readonly',
        tinymce: 'readonly',
        extractYoutubeId: 'readonly',
        startTimer: 'readonly',
        isLoggedIn: 'readonly',
        fetchSelf: 'readonly',
        logout: 'readonly',
        clearUserCache: 'readonly'
    }
};
