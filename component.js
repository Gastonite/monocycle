import castArray from 'lodash.castarray'
import isFunction from './assertions/isFunction'
import pipe from 'ramda/src/pipe'
import when from 'ramda/src/when'
import equals from 'ramda/src/equals'
import tryCatch from 'ramda/src/tryCatch'
import property from 'ramda/src/prop'
import capitalize from './utilities/capitalize'
import assoc from 'ramda/src/assoc'
import isEmpty from "./assertions/isEmpty"
import assertObject from "./assertions/assertObject"
import assertFunction from "./assertions/assertFunction"
import isArray from './assertions/isArray'
import { mergeSinks } from "cyclejs-utils"
import objOf from "ramda/src/objOf"
import applyTo from "ramda/src/applyTo"
import before from './operators/before'
import after from './operators/after'

const Empty = () => ({})

const defaultOperators = {
  before,
  after,
}

export const makeComponent = ({
  operators: _operators = defaultOperators,
  Combiners = Empty
} = {}) => {

  // const _cache = []

  _operators = (Object.keys(_operators) || []).reduce((before, key) => {

    // console.log('monocycle', 'defineOperator', key)
    const operator = _operators[key]

    return !isFunction(operator) ? before : {
      ...before,
      [key]: operator
    }
  }, {})


  const Component = (component = Component.Empty, kind) => {

    assertFunction(component, 'component', 'must be a dataflow component')

    if (component.isComponent)
      return component

    const name = component.name || kind

    kind = component.kind || kind || name

    if (!kind)
      throw new Error(`Please name your component (provided: ${component})`)

    const map = (f, name) => Component(f(component), name)

    const concat = (anotherComponent, options = {}) => {

      assertObject(options, 'options')

      return makeComposite(assoc('components', [
        component,
        ...castArray(anotherComponent).map((f, i) => {
          assertFunction(f, `anotherComponent[${i}]`, 'must be a dataflow component')
          return f
        })
      ], options))
    }

    const operators = (Object.keys(_operators) || []).reduce((before, key) => {

      // console.log('monocycle', 'addOperator', key)
      const operator = _operators[key]

      return Object.assign({}, before, {
        [key]: pipe(operator, component => map(
          component,
          component.kind || capitalize(key)
        ))
      })
    }, {})

    return Object.assign(component, {
      isComponent: true,
      kind: kind,
      map,
      concat,
      ...operators
    })
  }

  const parseOptions = (options = []) => pipe(
    when(isFunction, Array.of),
    when(isArray, objOf('components')),
    tryCatch(options => {

      assertObject(options, 'options')

      const components = castArray(options.components)
        .map(tryCatch(x => Component(x), (err, x, i) => {
          err.message = `Invalid 'components[${i}]' because ${err.message}`
          throw err
        }))

      return assoc('components', components, options)

    }, err => {
      throw Object.assign(err, { message: `Invalid Component: ${err.message}` })
    }),
  )(options)

  

  const makeComposite = pipe(
    parseOptions,
    options => {

      const { components } = options
      const combiners = Combiners(options)

      // console.log('makeComposite()', options)

      if (isEmpty(components))
        return Component.Empty

      // const foundIndex = _cache.findIndex(pipe(
      //   property('components'),
      //   equals(components)
      // ))

      // if (foundIndex > -1)
      //   return _cache[foundIndex].component

      options.kind = options.kind || `(${components.map(property('kind')).join('|')})`

      const Composite = sources => {

        // console.log('Composite()', {
        //   kind: options.kind, 
        //   components,
        //   combiners
        // })

        return mergeSinks(
          components.map(applyTo(sources)),
          combiners
        )
      }

      const component = Component(Composite, options.kind)

      // _cache.push({
      //   components,
      //   component
      // })

      return component
    }
  )

  Component.Empty = makeComposite.Empty = Component(Empty)

  return makeComposite
}

export default makeComponent