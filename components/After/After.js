const unless = require('ramda/src/unless')
const { coerce } = require('../../utilities/coerce')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const pipe = require('ramda/src/pipe');
const { makeEmptyObject } = require('../../utilities/empty')

const WithAfter = options => {

  const {
    has: afters
  } = coerce(options)

  return pipe(
    unless(isFunction, makeEmptyObject),
    component => {

      const After = sources => pipe(
        component,
        sinks => pipe(...afters)(sinks, sources)
      )(sources)

      return After
    }
  )
}

module.exports = {
  default: WithAfter,
  WithAfter
}