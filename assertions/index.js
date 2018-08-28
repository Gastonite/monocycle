const assert = require('browser-assert')
const stringify = require('../utilities/stringify')

const Assertion = (assertion, defaultMessage) => (input, label = 'input', message = defaultMessage) =>
  assert(
    assertion(input),
    `'${label}' ${message} (provided: ${stringify(input)})`
  ) || input

module.exports = {
  default: Assertion,
  Assertion,
  assert
}