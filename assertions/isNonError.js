const complement = require('ramda/src/complement')
const isError = require('./isError')

module.exports = complement(isError)