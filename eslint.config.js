const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
    {
        files: ['**/*.{js,ts}'],
        ignores: ['dist/**', 'node_modules/**'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                Buffer: 'readonly',
                console: 'readonly',
                module: 'readonly',
                process: 'readonly',
                require: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            indent: ['error', 4],
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'no-unused-vars': 'off'
        }
    }
];
