import $ from "xstream"
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import applyTo from "ramda/src/applyTo"
import { mergeSinks } from "cyclejs-utils"
import Component from "./"
import { div } from "@cycle/dom";

const _cached = []

export const Composed = (options = {}) => {

  const {
    components,
    View = div
  } = isFunction(options) || isArray(options)
      ? { components: options }
      : options

  const foundIndex = _cached.findIndex(composed => {
    return composed.components.every((component, i) =>
      component === components[i]
    )
  })

  if (foundIndex > -1)
    return _cached[foundIndex].composed

  const composed = Component(sources => {

    return mergeSinks(
      components.filter(isFunction).map(applyTo(sources)),
      {
        DOM: streams => $.combine(...streams).map(View)
      }
    )
  })

  _cached.push({
    components,
    composed
  })

  return composed
}

export default Composed