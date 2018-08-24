const isString = require('./isString')
const { Assertion } = require('.')

module.exports = Assertion(isString, 'must be a string')