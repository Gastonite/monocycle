const isolate = require('@cycle/isolate').default
const unless = require('ramda/src/unless')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const pipe = require('ramda/src/pipe')
const { makeEmptyObject } = require('../../utilities/empty')

const WithIsolated = scope => {

  return pipe(
    unless(isFunction, makeEmptyObject),
    component => {

      const Isolated = sources => isolate(component, scope)(sources)

      return Isolated
    }
  )
}

module.exports = {
  default: WithIsolated,
  WithIsolated
}