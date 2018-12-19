const always = require('ramda/src/always')

const EmptyObject = () => ({})

const EmptyArray = () => []

const EmptyString = () => ''

const makeEmptyObject = always(EmptyObject)

module.exports = {
  default: EmptyObject,
  EmptyObject,
  EmptyArray,
  EmptyString,
  makeEmptyObject
}