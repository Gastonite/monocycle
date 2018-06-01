import isFunction from 'lodash.isfunction'
import pipe from 'ramda/src/pipe'
import before from './operators/before'
import after from './operators/after'
import ConcatOperator from './operators/concat'

const defaultOperators = {
  before,
  after,
  concat: ConcatOperator()
}

const makeComponent = ({
  methods = {},
  operators: _operators = defaultOperators,
} = {}) => {

  const Component = factory => {

    factory = isFunction(factory)
      ? factory
      : Component.empty

    if (factory.isComponent)
      return factory

    const map = f => Component(f(factory))

    const operators = (Object.keys(_operators) || []).reduce((before, key) => {

      const operator = _operators[key]
  
      return !isFunction(operator) ? before : Object.assign({}, before, {
        [key]: pipe(operator, map)
      })
    }, {})

    return Object.assign(factory, operators, {
      isComponent: true,
      map
    })
  }

  Component.empty = () => ({})

  return Component
}

export default makeComponent