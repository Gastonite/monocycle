const complement = require('ramda/src/complement')
const isEmpty = require('./isEmpty')

module.exports = complement(isEmpty)