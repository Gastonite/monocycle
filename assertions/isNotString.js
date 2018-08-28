const complement = require('ramda/src/complement')
const isString = require('./isString')

module.exports = complement(isString)