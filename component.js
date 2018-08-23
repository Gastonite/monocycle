import castArray from 'lodash.castarray'
import isFunction from './assertions/isFunction'
import pipe from 'ramda/src/pipe'
import when from 'ramda/src/when'
import prop from 'ramda/src/prop'
import always from 'ramda/src/always'
import tryCatch from 'ramda/src/tryCatch'
import property from 'ramda/src/prop'
import capitalize from './utilities/capitalize'
import assoc from 'ramda/src/assoc'
import isEmpty from "./assertions/isEmpty"
import assertObject from "./assertions/assertObject"
import assertNonEmptyString from "./assertions/assertNonEmptyString"
import assertFunction from "./assertions/assertFunction"
import isArray from './assertions/isArray'
import { mergeSinks } from "cyclejs-utils"
import objOf from "ramda/src/objOf"
import applyTo from "ramda/src/applyTo"
import addIndex from "ramda/src/addIndex"
import map from "ramda/src/map"
import before from './operators/before'
import after from './operators/after'

const noop = always()
const mapIndexed = addIndex(map)
const EmptyObject = () => ({})

const defaultOperators = {
  before,
  after,
}


export const makeComponent = ({
  operators: _operators = defaultOperators,
  Empty = EmptyObject,
  Combiners = Empty,
  childrenKey = 'components',
  log = noop,
} = {}) => {

  assertNonEmptyString(childrenKey, 'childrenKey')

  _operators = (Object.keys(_operators) || []).reduce((before, key) => {

    log('defineOperator', key)

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

      const operator = _operators[key]

      return Object.assign({}, before, {
        [key]: pipe(operator, component => map(
          component,
          component.kind || capitalize(key)
        ))
      })
    }, {})

    return Object.assign(component, {
      ...operators,
      isComponent: true,
      kind: kind,
      map,
      concat,
      childrenKey,
    })
  }

  const parseChildren = options => assoc(
    'components',
    pipe(
      prop(childrenKey),
      castArray,
      mapIndexed(tryCatch(
        x => Component(x),
        (err, x, i) => {
          throw Object.assign(err, {
            message: `Invalid '${childrenKey}[${i}]' because ${err.message}`
          })
        })),
    )(options),
    options
  )

  const parseOptions = (options = []) => pipe(
    when(isFunction, Array.of),
    when(isArray, objOf(childrenKey)),
    tryCatch(parseChildren, err => {
      throw Object.assign(err, {
        message: `Invalid Component options: ${err.message}`
      })
    }),
  )(options)


  const makeComposite = pipe(
    parseOptions,
    options => {

      const { components } = options
      const combiners = Combiners(options)

      log('makeComposite()', options)

      if (isEmpty(components))
        return Component.Empty

      options.kind = options.kind || `(${components.map(property('kind')).join('|')})`

      const Composite = sources => {

        log('Composite()', {
          kind: options.kind,
          components,
          combiners
        })

        return mergeSinks(
          components.map(applyTo(sources)),
          combiners
        )
      }

      const component = Component(Composite, options.kind)

      return component
    }
  )

  Component.Empty = makeComposite.Empty = Component(Empty)

  return makeComposite
}

export default makeComponent