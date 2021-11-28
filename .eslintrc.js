const { nxModuleBoundaryRules } = require('./.eslintrc.module-boundaries');
const { join } = require('path');

/**
 * Roadmap typescript-eslint
 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
 *
 * ESLint Rules: https://eslint.org/docs/rules/
 */

module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  plugins: [
    'prettier',
    '@nrwl/eslint-plugin-nx',
    'unicorn', // https://www.npmjs.com/package/eslint-plugin-unicorn
  ],
  ignorePatterns: ['*.min.js', 'node_modules/'],

  settings: {
    polyfills: ['fetch', 'Promise', 'navigator.mediaDevices'],
  },

  rules: {
    'eslint-comments/no-unused-disable': 'error',
    'eslint-comments/no-use': [
      'error',
      {
        allow: ['eslint-enable', 'eslint-disable', 'eslint-disable-next-line'],
      },
    ],
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: false }],
    'eslint-comments/require-description': ['error', { ignore: [] }],
    'eslint-comments/no-restricted-disable': [
      'error',
      '*',
      '!compat',
      '!no-console',
      '!no-alert',
      '!prettier',
      '!complexity',
      '!max-lines-per-function',
      '!max-nested-callbacks',
    ],
    'arrow-parens': ['error', 'as-needed'],
    'brace-style': 'off', // handled by @typescript-eslint rule
    'compat/compat': 'error',
    'comma-spacing': 'off', // handled by @typescript-eslint rule
    'constructor-super': 'error',
    complexity: ['error', 10],
    'default-param-last': 'off', // handled by @typescript-eslint rule
    eqeqeq: 'error',
    'func-name-matching': ['error', 'always'],
    'guard-for-in': 'error',
    'lines-between-class-members': 'off',
    'max-depth': ['error', 4],
    'max-len': [
      'error',
      {
        code: 140,
        comments: 140,
        ignoreStrings: true,
        ignorePattern: '// eslint-disable',
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'max-lines': ['error', { max: 600, skipBlankLines: true }],
    'max-lines-per-function': [
      'error',
      { max: 45, skipBlankLines: true, skipComments: true },
    ],
    'max-nested-callbacks': ['error', 4],
    'max-params': ['error', 12],
    'no-alert': 'error',
    'no-await-in-loop': 'error',
    'no-bitwise': 'error',
    'no-dupe-class-members': 'error',
    'no-caller': 'error',
    'no-confusing-arrow': 'error',
    'no-console': 'error',
    'no-constructor-return': 'error',
    'no-continue': 'error',
    'no-debugger': 'error',
    'no-duplicate-case': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-empty': 'error',
    'no-empty-function': 'off', // handled by typescript-eslint rule
    'no-fallthrough': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-parens': 'off', // handled by prettier
    'no-extra-boolean-cast': 'off', // conflicts with strict boolean expressions
    'no-floating-decimal': 'error',
    'no-implicit-coercion': 'error',
    'no-invalid-this': 'off', // keep off
    'no-labels': ['error', { allowSwitch: true }],
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': 'off', // handled by typescript-eslint rule
    'no-new-wrappers': 'error',
    'no-param-reassign': 'error',
    'no-plusplus': 'error',
    'no-restricted-imports': ['error', 'rxjs/Rx'],
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow': 'off', // handled by typescript-eslint rule
    'no-shadow-restricted-names': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'off', // handled by typescript-eslint rule
    'no-undefined': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unreachable': 'error',
    'no-unsafe-finally': 'error',
    'no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true },
    ],
    'no-unused-labels': 'error',
    'no-useless-catch': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'prefer-const': 'error',
    'prefer-object-spread': 'error',
    'prefer-spread': 'error',
    'prefer-promise-reject-errors': 'error',
    'prettier/prettier': 'error',
    quotes: 'off', // handled by typescript eslint rule
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'sort-imports': 'off', // handled by simple-import-sort/sort
    radix: 'error',
    'require-atomic-updates': 'error',
    'require-await': 'off', // handled by typescript-eslint rule
    'require-jsdoc': [
      'off', // TODO: turn on
      {
        require: {
          FunctionDeclaration: false,
          MethodDefinition: false,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
        },
      },
    ],
    yoda: ['error', 'never'],
    'unicorn/filename-case': 'error',
  },

  overrides: [
    {
      files: ['**/*.js'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        createDefaultProgram: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'plugin:eslint-comments/recommended',
        'plugin:@nrwl/nx/javascript',
      ],
      plugins: [
        'prettier',
        'simple-import-sort', // https://github.com/lydell/eslint-plugin-simple-import-sort
        'eslint-comments', // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/
        'unicorn', // https://www.npmjs.com/package/eslint-plugin-unicorn
      ],
    },
    {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: [join(__dirname, './tsconfig.base.json')],
        createDefaultProgram: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:eslint-comments/recommended',
      ],
      plugins: [
        'prettier',
        '@typescript-eslint', // https://github.com/typescript-eslint/typescript-eslint
        '@angular-eslint', // https://github.com/angular-eslint/angular-eslint
        'simple-import-sort', // https://github.com/lydell/eslint-plugin-simple-import-sort
        'rxjs', // https://github.com/cartant/eslint-plugin-rxjs
        'compat', // https://www.npmjs.com/package/eslint-plugin-compat
        'eslint-comments', // https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/
        'unicorn', // https://www.npmjs.com/package/eslint-plugin-unicorn
        '@nrwl/eslint-plugin-nx',
      ],
      files: '**/*.ts',
      rules: {
        '@nrwl/nx/enforce-module-boundaries': ['error', nxModuleBoundaryRules],
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              Object: 'Avoid using the `Object` type. Did you mean `object`?',
              Boolean:
                'Avoid using the `Boolean` type. Did you mean `boolean`?',
              Number: 'Avoid using the `Number` type. Did you mean `number`?',
              String: 'Avoid using the `String` type. Did you mean `string`?',
              Symbol: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
            },
          },
        ],
        '@typescript-eslint/brace-style': ['error'],
        '@typescript-eslint/comma-spacing': ['error'],
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/default-param-last': ['error'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          { ignoredMethodNames: ['constructor'] },
        ],
        '@typescript-eslint/lines-between-class-members': [
          'error',
          'always',
          { exceptAfterOverload: true },
        ],
        '@typescript-eslint/member-ordering': [
          'error',
          {
            default: [
              'static-field',
              'instance-field',
              'static-method',
              'instance-method',
            ],
          },
        ],
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'parameter',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'property',
            format: ['camelCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'function',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'enum',
            format: ['PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'enumMember',
            format: ['UPPER_CASE'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'memberLike',
            modifiers: ['private'],
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'typeAlias',
            format: ['StrictPascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'typeParameter',
            format: ['StrictPascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'interface',
            format: ['PascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'class',
            format: ['StrictPascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
        ],
        '@typescript-eslint/no-dynamic-delete': 'error',
        '@typescript-eslint/no-empty-function': [
          'off',
          {
            allow: ['constructors'],
          },
        ],
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-extraneous-class': [
          'off',
          { allowEmpty: true, allowStaticOnly: true, allowWithDecorator: true },
        ],
        '@typescript-eslint/no-floating-promises': [
          'error',
          { ignoreVoid: true },
        ],
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-magic-numbers': [
          'off',
          {
            ignoreNumericLiteralTypes: true,
            ignoreReadonlyClassProperties: true,
            ignore: [-1, 0, 1],
            ignoreEnums: true /* ignore enumerators so that numeric values can be grouped via enums instead of constants */,
          },
        ],
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: false, checksConditionals: true },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-for-in-array': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-throw-literal': 'error',
        '@typescript-eslint/no-unnecessary-type-arguments': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': [
          'error',
          { typesToIgnore: [''] },
        ],
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { vars: 'all', args: 'none', ignoreRestSiblings: false },
        ],
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/no-use-before-define': [
          'error',
          { functions: false, classes: false },
        ],
        '@typescript-eslint/no-explicit-any': ['off', { ignoreRestArgs: true }],
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-readonly': ['error'],
        '@typescript-eslint/prefer-includes': 'error',
        '@typescript-eslint/prefer-readonly-parameter-types': [
          'off', // TODO: revise if this can be turned on, this rule seems to have buggy behavior
          {
            checkParameterProperties: false,
          },
        ],
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': [
          'error',
          { ignoreConditionalTests: true, ignoreMixedLogicalExpressions: true },
        ],
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/triple-slash-reference': [
          'error',
          { path: 'never', types: 'never', lib: 'never' },
        ],
        '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
        'arrow-parens': ['error', 'as-needed'],
        'brace-style': 'off', // handled by @typescript-eslint rule
        'compat/compat': 'warn',
        'comma-spacing': 'off', // handled by @typescript-eslint rule
        'constructor-super': 'error',
        complexity: ['warn', 10],
        'default-param-last': 'off', // handled by @typescript-eslint rule
        eqeqeq: 'error',
        'func-name-matching': ['error', 'always'],
        'guard-for-in': 'error',
        'lines-between-class-members': 'off',
        'max-depth': ['error', 5],
        'max-len': [
          'error',
          {
            code: 140,
            comments: 140,
            ignoreStrings: true,
            ignoreUrls: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
            ignoreTrailingComments: true,
          },
        ],
        'max-lines': ['warn', { max: 1100, skipBlankLines: true }],
        'max-lines-per-function': [
          'warn',
          { max: 75, skipBlankLines: true, skipComments: true },
        ],
        'max-nested-callbacks': ['warn', 4],
        'max-params': ['warn', 12],
        'no-alert': 'error',
        'no-await-in-loop': 'error',
        'no-bitwise': 'off',
        'no-dupe-class-members': 'error',
        'no-caller': 'error',
        'no-confusing-arrow': 'error',
        'no-console': 'off',
        'no-constructor-return': 'error',
        'no-continue': 'off',
        'no-class-assign': 'off',
        'no-debugger': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'error',
        'no-else-return': 'error',
        'no-empty': 'off',
        'no-empty-function': 'off', // handled by typescript-eslint rule
        'no-fallthrough': 'error',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-parens': 'off', // handled by prettier
        'no-floating-decimal': 'error',
        'no-implicit-coercion': 'error',
        'no-invalid-this': 'off',
        'no-labels': ['error', { allowSwitch: true }],
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-loop-func': 'error',
        'no-magic-numbers': 'off', // handled by typescript-eslint rule
        'no-new-wrappers': 'error',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-restricted-imports': ['error', 'rxjs/Rx'],
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-shadow': 'off', // handled by typescript-eslint rule
        'no-shadow-restricted-names': 'error',
        'no-template-curly-in-string': 'error',
        'no-throw-literal': 'off', // handled by typescript-eslint rule
        'no-undefined': 'off',
        'no-unmodified-loop-condition': 'error',
        'no-unreachable': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-expressions': [
          'error',
          { allowShortCircuit: true, allowTernary: true },
        ],
        'no-unused-labels': 'error',
        'no-useless-catch': 'error',
        'no-useless-concat': 'error',
        'no-useless-return': 'error',
        'prefer-const': 'error',
        'prefer-object-spread': 'error',
        'prefer-spread': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-rest-params': 'warn',
        'prettier/prettier': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'sort-imports': 'off', // handled by simple-import-sort/sort
        radix: 'error',
        'require-atomic-updates': 'error',
        'require-await': 'off', // handled by typescript-eslint rule
        'require-jsdoc': [
          'off', // TODO: review this rule and either remove it completely or turn it on
          {
            require: {
              FunctionDeclaration: true,
              MethodDefinition: false,
              ClassDeclaration: false,
              ArrowFunctionExpression: false,
              FunctionExpression: false,
            },
          },
        ],
        'rxjs/ban-observables': 'off',
        'rxjs/ban-operators': 'off',
        'rxjs/no-async-subscribe': 'error',
        'rxjs/no-ignored-error': 'off',
        'rxjs/no-ignored-observable': 'error',
        'rxjs/no-ignored-subscribe': 'off',
        'rxjs/no-ignored-subscription': 'error',
        'rxjs/no-internal': 'error',
        'rxjs/no-nested-subscribe': 'error',
        'rxjs/no-subclass': 'error',
        'rxjs/no-tap': 'off',
        'rxjs/no-exposed-subjects': 'error',
        yoda: ['error', 'never'],
      },
    },
    {
      files: '**/main.ts',
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: '**/test-setup.ts',
      rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.po.ts'],
      rules: {
        'require-jsdoc': 'off',
        'max-lines-per-function': 'off',
        'compat/compat': 'off',
        quotes: 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
    {
      files: '**/*.mock.ts',
      rules: {
        'require-jsdoc': 'off',
        'compat/compat': 'off',
      },
    },
  ],
};
