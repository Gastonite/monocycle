const { Stream: $ } = require('xstream')
// const pipe = require('ramda/src/pipe')
const { WithAfter } = require('../After')
const { isComponent } = require('../../component')
const { ensurePlainObj } = require('../../utilities/ensurePlainObj');
const { pipe } = require('../../utilities/pipe');
const when = require('ramda/src/when')
const objOf = require('ramda/src/objOf')
const prop = require('ramda/src/prop')
const over = require('ramda/src/over')
const applyTo = require('ramda/src/applyTo')
const always = require('ramda/src/always')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const lensProp = require('ramda/src/lensProp')
const unless = require('ramda/src/unless')
const { mergeSinks, extractSinks } = require('cyclejs-utils')

const WithDynamic = pipe(
  when(isFunction, objOf('from')),
  ensurePlainObj,
  over(lensProp('from'), unless(isFunction, always($.empty))),
  ({ from }) => {

    return component => {

      return sources => {

        return extractSinks(
          (from(component, sources) || $.empty())
            .filter(isComponent)
            .map(applyTo(sources)),
          Object.keys(sources)
        )
      }
    }
  }
)

const WithDynamic1 = pipe(
  when(isFunction, objOf('from')),
  ensurePlainObj,
  over(lensProp('from'), unless(isFunction, always($.empty))),
  ({ from }) => {

    return WithAfter((sinks, sources) => {

      return mergeSinks(
        [
          sinks,
          extractSinks(
            (from(sinks, sources) || $.empty())
              .filter(isComponent)
              .map(applyTo(sources)),
            Object.keys(sources)
          )
        ],
        Object.keys(sources)
      )
    })
  }
)

module.exports = {
  default: WithDynamic,
  WithDynamic
}