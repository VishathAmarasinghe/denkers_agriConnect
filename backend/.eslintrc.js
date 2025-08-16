module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Handled by TypeScript
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    
    // Code quality
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-lines': ['warn', 300],
    'max-params': ['warn', 5],
    
    // Error handling
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
