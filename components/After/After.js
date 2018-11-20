const unless = require('ramda/src/unless')
const { coerce } = require('../../utilities/coerce')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { pipe } = require('../../utilities/pipe');

const WithAfter = options => {

  const {
    has: afters
  } = coerce(options)

  return pipe(
    unless(isFunction, makeEmptyObject),
    // unless(isFunction, always(identity)),
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