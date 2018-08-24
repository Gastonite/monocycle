const complement = require('ramda/src/complement')
const isNegative = require('./isNegative')

module.exports = complement(isNegative)