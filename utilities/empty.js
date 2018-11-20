const always = require('ramda/src/always')

const EmptyObject = () => ({})

const makeEmptyObject = always(EmptyObject)

module.exports = {
  default: EmptyObject,
  EmptyObject,
  makeEmptyObject
}