const { makeComponent } = require('../../component')
const { Stream: $ } = require('xstream')
const identity = require('ramda/src/identity')
const { pipe } = require('../../utilities/pipe')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const map = require('ramda/src/map')
const unless = require('ramda/src/unless')
const prop = require('ramda/src/prop')
const when = require('ramda/src/when')
const always = require('ramda/src/always')
const objOf = require('ramda/src/objOf')
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const isNonEmptyString = require('ramda-adjunct/lib/isNonEmptyString').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { makeEmptyObject } = require('../../utilities/empty')
// const log = require('./utilities/log').Log('Listener')

const defaultCombine = (before, sink$) => sink$

const From = pipe(
  when(isNonEmptyString, prop),
  unless(isFunction, always($.empty))
)

const WithListener = pipe(
  unless(isPlainObj, objOf('from')),
  over(lensProp('Component'), pipe(
    unless(isFunction, () => makeComponent())
  )),
  over(lensProp('from'), From),
  over(lensProp('to'), unless(isNonEmptyString, always(void 0))),
  over(lensProp('combine'), unless(isFunction, always(defaultCombine))),
  ({ Component, from, to, combine }) => {

    return pipe(
      unless(isFunction, makeEmptyObject),
      component => Component(sources => {

        let sinks = component(sources)

        const event$ = (from(sinks, sources) || $.empty())

        if (!to)
          return event$.addListener(identity) || sinks

        return {
          ...sinks,
          [to]: !sinks[to]
            ? event$
            : combine(sinks[to], event$)
        }
      })
    )
  }
)



module.exports = {
  default: WithListener,
  WithListener,
  From
}