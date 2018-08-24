const both = require('ramda/src/both')
const isNotEmpty = require('./isNotEmpty')
const isString = require('./isString')

module.exports = both(isString, isNotEmpty)