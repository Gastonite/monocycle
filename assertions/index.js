const assert = require('browser-assert')

const Assertion = (assertion, defaultMessage) => (input, label = 'input', message = defaultMessage) =>
  assert(
    assertion(input),
    `'${label}' ${message} (provided: ${input && input.toString()})`
  ) || input

module.exports = {
  default: Assertion,
  Assertion,
  assert
}