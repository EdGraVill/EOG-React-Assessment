module.exports = {
  env: {
    browser: true,
    es6: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    quotes: ['error', 'single'],
    '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
    'import/prefer-default-export': 'off', // If I want to export only one variable I should be
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/jsx-filename-extension': [1, { 'extensions': ['.jsx', '.tsx'] }],
    'react/jsx-one-expression-per-line': 'off',
    'react/prop-types': 'off',
    'no-param-reassign': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
