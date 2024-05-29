import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pkg from 'eslint-config-prettier';
const { rules } = pkg;

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  pluginJs.configs.recommended,

  eslintPluginPrettierRecommended,

  {
    rules: {
      ...rules,
      semi: 'error',
      quotes: ['error', 'single'],
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 'first',
          ImportDeclaration: 'first',
          ArrayExpression: 'first',
          ObjectExpression: 'first',
          CallExpression: { arguments: 'first' },
          FunctionDeclaration: { body: 1, parameters: 4 },
          FunctionExpression: { body: 1, parameters: 4 },
        },
      ],
      'space-before-blocks': 'error',
      'space-in-parens': 'error',
      'space-infix-ops': 'error',
    },
  },
];
