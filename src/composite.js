import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import apply from "ramda/src/apply"
import merge from "snabbdom-merge"
import Composed from "./composed"

export const Composite = (options = {}) => {

  const {
    components,
    View = apply(merge)
  } = isFunction(options) || isArray(options)
      ? { components: options }
      : options

  return Composed({
    View,
    components
  })
}

export default Composite