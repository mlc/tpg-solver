module.exports = {
  trailingComma: 'es5',
  singleQuote: true,
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: ['react', '<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderSortSpecifiers: true,
};
