const complement = require('ramda/src/complement')
const isDate = require('./isDate')

module.exports = complement(isDate)