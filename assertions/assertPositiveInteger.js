const isNonNegativeInteger = require('./isNonNegativeInteger')
const { Assertion } = require('.')

module.exports = Assertion(isNonNegativeInteger, 'must be a non-negative integer')