const both = require('ramda/src/both')
const isNotEmpty = require('./isNotEmpty')
const isArray = require('./isArray')

module.exports = both(isArray, isNotEmpty)