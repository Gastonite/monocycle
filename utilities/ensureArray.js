const pipe = require('ramda/src/pipe')
const when = require('ramda/src/when')
const isUndefined = require('ramda-adjunct/lib/isUndefined').default
const { EmptyArray } = require('./empty')

const ensureArray = pipe(
  when(isUndefined, EmptyArray),
  require('ramda-adjunct/lib/ensureArray').default
)

module.exports = {
  default: ensureArray,
  ensureArray
}