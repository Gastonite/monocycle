const unless = require('ramda/src/unless')
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const { EmptyObject } = require('../utilities/empty')

const ensurePlainObj = unless(isPlainObj, EmptyObject)

module.exports = {
  default: ensurePlainObj,
  ensurePlainObj
}