const both = require('ramda/src/both')
const isPositive = require('./isPositive')
const isInteger = require('./isInteger')

const isPositiveInteger = both(isInteger, isPositive)

module.exports = isPositiveInteger