module.exports = {
  root: true,
  extends: [
    '@react-native',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // Tidak boleh ada any
    '@typescript-eslint/no-explicit-any': 'error',
    // Semua fungsi publik harus punya return type
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
    // Tidak ada unused variables
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    // Prefer named exports
    'import/prefer-default-export': 'off',
    // Tidak ada console.log di production (warn saja agar tidak block dev)
    'no-console': 'warn',
  },
};
