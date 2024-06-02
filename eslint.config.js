const globals = require('globals');
const pluginJs = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const pkg = require('eslint-config-prettier');
const { rules } = pkg;

module.exports = [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,

  eslintPluginPrettierRecommended,

  {
    rules: {
      ...rules,
      semi: 'error',
      quotes: ['error', 'single'],
      'space-before-blocks': 'error',
      'space-in-parens': 'error',
      'space-infix-ops': 'error',
    },
  },
];
