import $ from "xstream";
// import { logState } from "utilities/logger"
import isString from "lodash/isString"
import isArray from "lodash/isArray"
import isObject from "lodash/isObject"
import isFunction from "lodash/isFunction"
import assert from 'browser-assert'
import identity from 'ramda/src/identity'
import property from "lodash/property"
import WithListener from './listener'
import eq from 'lodash/fp/eq'
import curry from 'lodash/curry'



export const prefixNameReducer = ({ kind, is } = {}, name) => {

  return !isString(kind) ? name : (
    `${!isArray(is) ? kind : '(' + is.join(',') + ')'} ${name}`
  )
}

export const logState = curry((name, reducer) => {

  let noPrefix = false

  if (isObject(name)) {

    noPrefix = Boolean(name.noPrefix)
    name = name.name
  }

  return before => {

    const after = reducer(before)


    if (!noPrefix && isObject(after))
      name = prefixNameReducer(after, name)

    !eq(before, after) && console.log(`%c${name}:`, [
      'color: #26c47d',
      'color: #32b87c',
      // 'font-weight: bold',
    ].join(';'), { before, after })

    return after
  }
})


export const WithReducer = (options = {}, override = false) => {

  options = !isFunction(options)
    ? options
    : { reducer: options }

  const {
    reducer = identity,
    name = 'init',
    before = true
  } = options

  // console.log('WithReducer()', options)

  const from = isString(options.from)
    ? property(options.from)
    : options.from

  const getReducer$ = !isFunction(from)
    ? () => $.of(null).mapTo(reducer)
    : (sinks, sources) => (from(sinks, sources) || $.of(void 0)).map(reducer)

  return WithListener({
    from: (sinks, sources) => {

      const args = [
        getReducer$(sinks, sources).map(logState(name)),
        sinks.onion || $.empty()
      ]

      return $.merge.apply(null,
        before
          ? args
          : args.reverse()
      )
    },
    to: 'onion'
  })
}

export default WithReducer