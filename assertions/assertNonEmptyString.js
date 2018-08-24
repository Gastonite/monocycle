const isNonEmptyString = require('./isNonEmptyString')
const { Assertion } = require('.')

module.exports = Assertion(isNonEmptyString, 'must be a non-empty string')