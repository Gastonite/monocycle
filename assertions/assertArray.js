const isArray = require('./isArray')
const { Assertion } = require('.')

module.exports = Assertion(isArray, 'must be an array')