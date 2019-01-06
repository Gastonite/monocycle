const { Stream: $ } = require('xstream')
const { makeComponent } = require('../../component')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const noop = require('ramda-adjunct/lib/noop').default
const unless = require('ramda/src/unless')
const always = require('ramda/src/always')
const pipe = require('ramda/src/pipe')
const { ensurePlainObj } = require('../../utilities/ensurePlainObj')
const lensProp = require('ramda/src/lensProp')
const over = require('ramda/src/over')
const defaultTo = require('ramda/src/defaultTo')
const when = require('ramda/src/when')
const { isComponent } = require('../../component')
const objOf = require('ramda/src/objOf')
const applyTo = require('ramda/src/applyTo')
const { extractSinks } = require('cyclejs-utils')
const { isObservable } = require('../../utilities/isObservable')
const { makeEmptyObject } = require('../../utilities/empty')
const keys = require('ramda/src/keys')
// const log = require('../../utilities/log').Log('Dynamic')

const WithDynamic = pipe(
  when(isFunction, objOf('from')),
  ensurePlainObj,
  over(lensProp('Component'), pipe(
    unless(isFunction, () => makeComponent())
  )),
  over(lensProp('SinksKeys'),
    unless(isFunction, always(keys))
  ),
  over(lensProp('from'), unless(isFunction, always(noop))),
  ({ Component, from, SinksKeys }) => {


    return pipe(
      x => x,
      unless(isFunction, makeEmptyObject),
      component => Component(pipe(
        defaultTo(void 0),
        ensurePlainObj,
        sources => {

          const sinks$ = pipe(
            from,
            unless(isObservable, $.of),
          )(component, sources)

          return extractSinks(
            sinks$
              .map(pipe(
                unless(isComponent, Component),
                applyTo(sources),
              ))
              .remember(),
            SinksKeys(sources)
          )
        }
      ))
    )
  }
)

module.exports = {
  default: WithDynamic,
  WithDynamic
}