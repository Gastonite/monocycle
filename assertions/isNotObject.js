const complement = require('ramda/src/complement')
const isObject = require('./isObject')

module.exports = complement(isObject)