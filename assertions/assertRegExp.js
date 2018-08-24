const isRegExp = require('./isRegExp')
const { Assertion } = require('.')

module.exports = Assertion(isRegExp, 'must be a RegExp object')