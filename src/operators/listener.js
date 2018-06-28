import isString from "lodash/isString"
import isFunction from "lodash/isFunction"
import $ from "xstream"
import get from "lodash/get"
import identity from 'ramda/src/identity'
import property from 'lodash/property'
import assert from 'browser-assert'

const WithListener = (options = {}) => {

  let {
    kind = 'Listener',
    from,
    combiner = (before, sink$) => sink$,
    to
  } = isFunction(options) || isString(options)
      ? { from: options }
      : options

  if (isString(from))
    from = property(from)

  assert(isFunction(from), `'from' must be a function`)

  return component => sources => {

    const sinks = component(sources)


    const event$ = from(sinks, sources) || $.empty()

    return isString(to)
      ? Object.assign({}, sinks, { [to]: !sinks[to] ? event$ : combiner(sinks[to], event$) })
      : (event$.addListener(identity) || sinks)
  }
}

export default WithListener