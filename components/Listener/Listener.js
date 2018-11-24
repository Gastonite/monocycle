const { default: $ } = require('xstream')
const identity = require('ramda/src/identity')
const pipe = require('ramda/src/pipe')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const filter = require('ramda/src/filter')
const map = require('ramda/src/map')
const unless = require('ramda/src/unless')
const prop = require('ramda/src/prop')
const when = require('ramda/src/when')
const always = require('ramda/src/always')
const objOf = require('ramda/src/objOf')
const isObj = require('ramda-adjunct/lib/isObj').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isNonEmptyString = require('ramda-adjunct/lib/isNonEmptyString').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { EmptyObject } = require('../../utilities/empty')
const { Factory } = require('../../utilities/factory')

// const log = require('./utilities/log').Log('Listener')

prop.isProp = true
const defaultCombine = (before, sink$) => sink$

const WithListener = pipe(
  ensureArray,
  filter(isObj),
  map(pipe(
    unless(isPlainObj, objOf('from')),
    over(lensProp('from'), pipe(
      when(isNonEmptyString, prop),
      unless(isFunction, always($.empty))
    )),
    over(lensProp('to'), unless(isNonEmptyString, always(void 0))),
    over(lensProp('combine'), unless(isFunction, always(defaultCombine))),
  )),
  listeners => {

    const withListener = pipe(
      unless(isFunction, always(EmptyObject)),
      (component) => {

        return sources => {

          let sinks = component(sources)

          sinks = listeners.reduce((sinks, { from, to, combine }) => {

            const event$ = (from(sinks, sources) || $.empty())

            if (!to)
              return event$.addListener(identity) || sinks

            return {
              ...sinks,
              [to]: !sinks[to]
                ? event$
                : combine(sinks[to], event$)
            }
          }, sinks)

          return sinks
        }
      }
    )

    return withListener
  }
)

module.exports = {
  default: WithListener,
  WithListener,
  makeListener: Factory(WithListener),
}