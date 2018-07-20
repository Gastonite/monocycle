import isObject from './isObject'
import assert from 'browser-assert'

const Assertion = (assertion, defaultMessage) => (input, label = 'input', message = defaultMessage) =>
  assert(
    assertion(input),
    `'${label}' ${message} (provided: ${input && input.toString()})`
  ) || input

export {
  Assertion as default,
  assert
}