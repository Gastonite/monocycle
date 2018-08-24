const both = require('ramda/src/both')
const isNotNegative = require('./isNotNegative')
const isInteger = require('./isInteger')

const isNonNegativeInteger = both(isInteger, isNotNegative)

module.exports = isNonNegativeInteger