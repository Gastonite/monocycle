const prop = require('ramda/src/prop')
const isNonPositiveInteger = require('./isNonPositiveInteger')

const isEmpty = x => isNonPositiveInteger(prop('length', x))

module.exports = isEmpty