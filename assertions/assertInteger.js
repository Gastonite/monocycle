const isInteger = require('./isInteger')
const { Assertion } = require('.')

module.exports = Assertion(isInteger, 'must be an integer')