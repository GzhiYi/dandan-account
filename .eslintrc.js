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
    roundFun: 'readonly',
    Page: 'writable',
    wx: 'writable'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-console': 1,
    'semi': 0,
    'import/no-unresolved': 0,
    'consistent-return': 0
  },
};
