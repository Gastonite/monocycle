const isNonEmptyArray = require('./isNonEmptyArray')
const { Assertion } = require('.')

module.exports = Assertion(isNonEmptyArray, 'must be a non-empty array')