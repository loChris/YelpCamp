const { format } = require('morgan')

module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'none',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  jsxBracketSameLine: false,
  // defaults
  rangeStart: 0,
  rangeEnd: Infinity,
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitiviy: 'css'
}
