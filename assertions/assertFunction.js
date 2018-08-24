const isFunction = require('./isFunction')
const { Assertion } = require('.')

module.exports = Assertion(isFunction, 'must be a function')