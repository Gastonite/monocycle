const complement = require('ramda/src/complement')
const isPositive = require('./isPositive')

module.exports = complement(isPositive)