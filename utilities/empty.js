const always = require('ramda/src/always')

const EmptyObject = () => ({})

const EmptyArray = () => []

const makeEmptyObject = always(EmptyObject)

module.exports = {
  default: EmptyObject,
  EmptyObject,
  EmptyArray,
  makeEmptyObject
}