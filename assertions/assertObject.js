const isObject = require('./isObject')
const { Assertion } = require('.')

module.exports = Assertion(isObject, 'must be an object')