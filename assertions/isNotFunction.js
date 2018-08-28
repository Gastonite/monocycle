const complement = require('ramda/src/complement')
const isFunction = require('./isFunction')

module.exports = complement(isFunction)