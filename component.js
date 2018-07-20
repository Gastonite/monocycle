import $ from "xstream"
import isFunction from 'lodash.isfunction'
import pipe from 'ramda/src/pipe'
import when from 'ramda/src/when'
import equals from 'ramda/src/equals'

import tryCatch from 'ramda/src/tryCatch'
import property from 'ramda/src/prop'
import capitalize from './utilities/capitalize'
import assoc from 'ramda/src/assoc'
import isEmpty from "./assertions/isEmpty"
import assertArray from "./assertions/assertArray"
import assertObject from "./assertions/assertObject"
import assertFunction from "./assertions/assertFunction"
import isArray from 'lodash/isArray'
import { mergeSinks } from "cyclejs-utils"
import applyTo from "ramda/src/applyTo"
import before from './operators/before'
import after from './operators/after'

const Empty = () => ({})


const defaultOperators = {
  before,
  after,
}

const makeComponent = ({
  operators: _operators = defaultOperators,
  Combiners = Empty
} = {}) => {

  const _cache = []

  const Component = (component = Component.Empty, kind) => {

    assertFunction(component, 'component', 'must be a dataflow component')

    if (component.isComponent)
      return component

    const name = component.name || kind

    kind = component.kind || kind || name

    if (!kind)
      throw new Error(`Please name your component (provided: ${component})`)

    console.log(`Component`, {
      kind: !name || kind === name
        ? kind
        : `${name}(${kind})`
    })

    const map = (f, name) => Component(f(component), name)

    const concat = (anotherComponent, options = {}) => {

      assertFunction(anotherComponent, 'anotherComponent', 'must be a dataflow component')
      assertObject(options, 'options')

      return Composite(assoc('components', [
        component,
        anotherComponent
      ], options))
    }

    const operators = (Object.keys(_operators) || []).reduce((before, key) => {

      const operator = _operators[key]

      return !isFunction(operator) ? before : Object.assign({}, before, {
        [key]: pipe(operator, f => map(f, f.kind || capitalize(key)))
      })
    }, {})

    return Object.assign(component, operators, {
      isComponent: true,
      kind: kind,
      map,
      concat
    })
  }


  const log = message => (x, ...args) => console.log(message, x, ...args) || x

  const parseOptions = (options = []) => pipe(
    when(isFunction, Array.of),
    when(isArray, components => ({ components })),
    tryCatch(options => {

      assertObject(options, 'options')

      assertArray(options.components, 'components')

      return assoc(
        'components',
        options.components.filter(isFunction).map(tryCatch(x => Component(x), (err, x, i) => {
          err.message = `Invalid 'components[${i}]' because ${err.message}`
          throw err
        }))
      )(options)

    }, err => {
      throw Object.assign(err, { message: `Invalid Component: ${err.message}` })
    }),
    // log('parseOptions2'),

  )(options)


  const Composite = pipe(
    parseOptions,
    options => {

      const {
        components,
        kind = components.map(property('kind')).join('|')
      } = options


      if (isEmpty(components))
        return Component.Empty

      const foundIndex = _cache.findIndex(pipe(
        property('components'),
        equals(components)
      ))

      if (foundIndex > -1)
        return _cache[foundIndex].component

      const Composite = sources => {

        console.log('Composite()', components)
        return mergeSinks(
          components.map(applyTo(sources)),
          Combiners(options)
        )
      }

      const component = components.length === 1
        ? Component(components[0])
        : Component(Composite, kind)

      _cache.push({
        components,
        component
      })

      return component
    }
  )

  Component.Empty = Composite.Empty = Component(Empty)


  return Composite
}

export default makeComponent