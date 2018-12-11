const propSatisfies = require('ramda/src/propSatisfies')
const isFunctor = require('@f/is-functor')
const both = require('ramda/src/both')
const isFunction = require('ramda-adjunct/lib/isFunction').default


const isObservable = both(
  isFunctor,
  propSatisfies(isFunction, 'subscribe'),
)

module.exports = {
  default: isObservable,
  isObservable
}