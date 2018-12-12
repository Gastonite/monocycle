const $ = require('xstream').default
const dropRepeats = require('xstream/extra/dropRepeats').default
// const log = require('../../utilities/log').Log('Switch')
const { Memoize } = require('../../utilities/memoize')
const { makeEmptyObject } = require('../../utilities/empty')
const { ensurePlainObj } = require('../../utilities/ensurePlainObj')
const { WithAfter } = require('../After')
const { makeComponent } = require('../../component')
const isTrue = require('ramda-adjunct/lib/isTrue').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const noop = require('ramda-adjunct/lib/noop').default
const isNonEmptyString = require('ramda-adjunct/lib/isNonEmptyString').default
const unless = require('ramda/src/unless')
const prop = require('ramda/src/prop')
const keys = require('ramda/src/keys')
const reduce = require('ramda/src/reduce')
const either = require('ramda/src/either')
const identity = require('ramda/src/identity')
const F = require('ramda/src/F')
const applyTo = require('ramda/src/applyTo')
const ifElse = require('ramda/src/ifElse')
const always = require('ramda/src/always')
const lensProp = require('ramda/src/lensProp')
const over = require('ramda/src/over')
const when = require('ramda/src/when')
const map = require('ramda/src/map')
const pipe = require('ramda/src/pipe')
const { Case } = require('./Case')


const WithSwitch = pipe(
  ensurePlainObj,
  over(lensProp('Component'), pipe(
    unless(isFunction, () => makeComponent()),
  )),
  over(lensProp('from'), pipe(
    when(isNonEmptyString, prop),
    unless(isFunction, always(noop))
  )),
  options => over(lensProp('merge'), unless(isFunction,
    ifElse(isTrue,
      always(options.Component),
      always(false)
    )))(options),
  over(lensProp('Default'), pipe(
    unless(isFunction, always(makeEmptyObject)),
    ifElse(prop('isComponent'), always, identity)
  )),
  over(lensProp('resolve'), pipe(
    ensureArray,
    map(unless(isFunction, always(F))),
  )),
  over(lensProp('SinksKeys'),
    unless(isFunction, always(keys))
  ),
  ({ Component, from, resolve: resolvers, merge, Default, SinksKeys }) => {

    const resolve = either(value => {

      if (!merge) {

        let resolved

        resolvers.some(resolve => {
          const returned = resolve(value)

          return returned && (resolved = returned)
        })

        return resolved
      }

      return merge(
        resolvers
          .map(applyTo(value))
          .filter(Boolean)
      )
    }, Default)

    return f => Component(f)

      .map(WithAfter((sinks, sources) => {

        const memoize = Memoize(sources)

        const value$ = (from(sinks, sources) || $.empty())
          .compose(dropRepeats())
          .map(resolve)
          .map(memoize)
          .remember()

        return pipe(
          SinksKeys,
          reduce((before, key) => ({
            ...before,
            [key]: value$
              .map(either(prop(key), $.empty))
              .flatten()
          }), sinks)
        )(sources)

      }))
  }
)

module.exports = {
  default: WithSwitch,
  WithSwitch,
  Case
}