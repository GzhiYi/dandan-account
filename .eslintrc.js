module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    Component: 'readonly',
    getApp: 'writable',
    roundFun: 'writable',
    Page: 'writable',
    wx: 'writable',
    getCurrentPages: 'readonly',
    App: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-console': 1,
    'semi': 0,
    'import/no-unresolved': 0,
    'consistent-return': 0,
    'no-underscore-dangle': 0,
    'max-len': 0,
    'no-nested-ternary': 0,
    'no-param-reassign': 0,
    'new-cap': 0,
    'func-names': 0,
    'camelcase': 0,
    'import/no-extraneous-dependencies': 0
  },
};
