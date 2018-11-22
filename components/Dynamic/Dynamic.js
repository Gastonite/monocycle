const $ = require('xstream').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const unless = require('ramda/src/unless')
const always = require('ramda/src/always')
const { ensurePlainObj } = require('monocycle/utilities/ensurePlainObj')
const lensProp = require('ramda/src/lensProp')
const over = require('ramda/src/over')
const defaultTo = require('ramda/src/defaultTo')
const when = require('ramda/src/when')
const pipe = require('ramda/src/pipe')
const { isComponent } = require('monocycle/component')
const objOf = require('ramda/src/objOf')
const applyTo = require('ramda/src/applyTo')
const { extractSinks } = require('cyclejs-utils')
const { makeEmptyObject } = require('monocycle/utilities/empty')

const WithDynamic = pipe(
  when(isFunction, objOf('from')),
  ensurePlainObj,
  over(lensProp('from'), unless(isFunction, always($.empty))),
  ({ from }) => pipe(
    unless(isFunction, makeEmptyObject),
    component => pipe(
      defaultTo(void 0),
      ensurePlainObj,
      sources => extractSinks(
        (from(component, sources) || $.empty())
          .filter(isComponent)
          .map(applyTo(sources)),
        Object.keys(sources)
      )
    )
  )
)


module.exports = {
  default: WithDynamic,
  WithDynamic
}