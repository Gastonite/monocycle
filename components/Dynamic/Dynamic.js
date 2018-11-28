const $ = require('xstream').default
const { Component } = require('../../component')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const unless = require('ramda/src/unless')
const always = require('ramda/src/always')
const { pipe } = require('../../utilities/pipe')
const { ensurePlainObj } = require('../../utilities/ensurePlainObj')
const lensProp = require('ramda/src/lensProp')
const over = require('ramda/src/over')
const defaultTo = require('ramda/src/defaultTo')
const when = require('ramda/src/when')
const { isComponent } = require('../../component')
const objOf = require('ramda/src/objOf')
const applyTo = require('ramda/src/applyTo')
const { extractSinks } = require('cyclejs-utils')
const { makeEmptyObject } = require('../../utilities/empty')

const WithDynamic = pipe(
  when(isFunction, objOf('from')),
  ensurePlainObj,
  over(lensProp('from'), unless(isFunction, always($.empty))),
  ({ from }) => pipe(
    unless(isFunction, makeEmptyObject),
    component => Component(pipe(
      defaultTo(void 0),
      ensurePlainObj,
      sources => extractSinks(
        (from(component, sources) || $.empty())
          .filter(isComponent)
          .map(applyTo(sources))
          .remember(),
        Object.keys(sources)
      )
    ))
  )
)

module.exports = {
  default: WithDynamic,
  WithDynamic
}