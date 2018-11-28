const unless = require('ramda/src/unless')
const objOf = require('ramda/src/objOf')
const when = require('ramda/src/when')
const over = require('ramda/src/over')
const reject = require('ramda/src/reject')
const { pipe } = require('./pipe')
const { EmptyObject } = require('./empty')
const lensProp = require('ramda/src/lensProp')
const isFalsy = require('ramda-adjunct/lib/isFalsy').default
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const isUndefined = require('ramda-adjunct/lib/isUndefined').default

const coerce = pipe(
  when(isFalsy, EmptyObject),
  unless(isPlainObj, objOf('has')),
  over(lensProp('has'), pipe(ensureArray, reject(isUndefined))),
)

module.exports = {
  default: coerce,
  coerce
}