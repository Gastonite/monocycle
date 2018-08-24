const complement = require('ramda/src/complement')
const isPlainObject = require('./isPlainObject')

module.exports = complement(isPlainObject)