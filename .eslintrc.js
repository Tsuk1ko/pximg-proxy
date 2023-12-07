const offTsRules = [
  'strict-boolean-expressions',
  'prefer-nullish-coalescing',
  'no-non-null-assertion',
  'promise-function-async',
  'explicit-function-return-type',
  'no-floating-promises',
  'no-misused-promises',
  'restrict-template-expressions',
  'no-confusing-void-expression',
  'no-throw-literal',
  'ban-types',
  'return-await',
];

module.exports = {
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: ['standard-with-typescript', 'plugin:import/recommended', 'plugin:import/typescript', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json',
  },
  rules: {
    ...Object.fromEntries(offTsRules.map(name => [`@typescript-eslint/${name}`, 'off'])),
    'import/order': ['warn', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'] }],
    'import/no-named-as-default': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/member-ordering': 'warn',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
