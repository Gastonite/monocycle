const castArray = require('lodash.castarray')
const isFunction = require('./assertions/isFunction')
const pipe = require('ramda/src/pipe')
const when = require('ramda/src/when')
const prop = require('ramda/src/prop')
const always = require('ramda/src/always')
const tryCatch = require('ramda/src/tryCatch')
const property = require('ramda/src/prop')
const capitalize = require('./utilities/capitalize')
const assoc = require('ramda/src/assoc')
const assertObject = require('./assertions/assertObject')
const assertNonEmptyString = require('./assertions/assertNonEmptyString')
const assertFunction = require('./assertions/assertFunction')
const isArray = require('./assertions/isArray')
const { mergeSinks } = require('cyclejs-utils')
const objOf = require('ramda/src/objOf')
const applyTo = require('ramda/src/applyTo')
const addIndex = require('ramda/src/addIndex')
const map = require('ramda/src/map')
const before = require('./operators/before')
const after = require('./operators/after')

const noop = always()
const mapIndexed = addIndex(map)
const EmptyObject = () => ({})

const defaultOperators = {
  before,
  after,
}


const makeComponent = ({
  operators: _operators = defaultOperators,
  Empty = EmptyObject,
  Combiners = Empty,
  hasKey = 'has',
  log = noop,
  strict = true
} = {}) => {

  assertNonEmptyString(hasKey, 'hasKey')

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

    strict && assert(kind, `Please name your component (provided: ${component})`)

    const map = (f, name) => Component(f(component), name)

    const concat = (anotherComponent, options = {}) => {

      assertObject(options, 'options')

      return makeComposite(assoc(hasKey, [
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
    })
  }

  const parseChildren = options => assoc(
    hasKey,
    pipe(
      prop(hasKey),
      castArray,
      mapIndexed(tryCatch(
        x => Component(x),
        (err, x, i) => {
          throw Object.assign(err, {
            message: `Invalid '${hasKey}[${i}]' because ${err.message}`
          })
        })),
    )(options),
    options
  )

  const parseOptions = (options = []) => pipe(
    when(isFunction, Array.of),
    when(isArray, objOf(hasKey)),
    tryCatch(parseChildren, err => {
      throw Object.assign(err, {
        message: `Invalid Component options: ${err.message}`
      })
    }),
  )(options)


  const makeComposite = pipe(
    parseOptions,
    options => {

      const has = options[hasKey]
      const combiners = Combiners(options)

      log('makeComposite()', {
        combiners,
        options
      })

      // if (isEmpty(has))
      //   return Component.Empty

      options.kind = options.kind || `(${has.map(property('kind')).join('|')})`

      const Composite = sources => {

        log('Composite()', {
          kind: options.kind,
          [hasKey]: has,
          combiners
        })

        return has.length > 1 || has[0] !== Empty
          ? mergeSinks(
            has.map(applyTo(sources)),
            combiners
          )
          : Object.keys(combiners).reduce((before, key) => ({
            ...before,
            [key]: combiners[key]([])
          }), {})
      }

      const component = Component(Composite, options.kind)

      return component
    }
  )

  Component.Empty = makeComposite.Empty = Component(Empty)
  Component.hasKey = makeComposite.hasKey = hasKey
  Component.log = makeComposite.log = log


  return makeComposite
}

module.exports = {
  default: makeComponent,
  makeComponent
}