const castArray = require('lodash/castArray')
const isFunction = require('lodash/isFunction')
const isString = require('./assertions/isString')
const { assert } = require('./assertions')
const filter = require('ramda/src/filter')
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
const { mergeSinks } = require('cyclejs-utils')
const objOf = require('ramda/src/objOf')
const lensProp = require('ramda/src/lensProp')
const over = require('ramda/src/over')
const applyTo = require('ramda/src/applyTo')
const isNotPlainObject = require('./assertions/isNotPlainObject')
const addIndex = require('ramda/src/addIndex')
const map = require('ramda/src/map')
const { beforeOperator } = require('./operators/before')
const { afterOperator } = require('./operators/after')
const noop = always()
const mapIndexed = addIndex(map)

const Empty = () => ({})


const defaultOperators = {
  before: beforeOperator,
  after: afterOperator,
}

const makeComponent = ({
  operators: _operators = defaultOperators,
  EmptyComponent = Empty,
  Combiners = EmptyComponent,
  fromString = EmptyComponent,
  hasKey = 'has',
  log = noop,
  enforceName = true
} = {}) => {

  assertNonEmptyString(hasKey, 'hasKey')

  const coerce = pipe(
    when(
      isNotPlainObject,
      objOf(hasKey)
    ),
    over(lensProp(hasKey), castArray)
  )

  _operators = (Object.keys(_operators) || []).reduce((before, key) => {

    log('defineOperator', key)

    const operator = _operators[key]

    return !isFunction(operator)
      ? before
      : Object.assign(before, { [key]: operator })
  }, {})


  const Component = (component = Component.Empty, kind) => {

    if (isString(component))
      return makeComposite(fromString(component))

    assertFunction(component, 'component', 'must be a dataflow component')

    if (component.isComponent)
      return component

    const name = component.name || kind

    kind = component.kind || kind || name || 'Unnamed'

    log('Component()', {
      kind
    })

    enforceName && assert(kind !== 'Unnamed', `Please name your component (provided: ${component})`)

    const map = (f, name) => Component(f(component), name)

    const concat = (anotherComponent, options = {}) => {

      assertObject(options, 'options')

      return makeComposite(
        assoc(
          hasKey,
          [component].concat(castArray(anotherComponent).map((f, i) => {
            assertFunction(f, `anotherComponent[${i}]`, 'must be a dataflow component')
            return f
          })),
          options
        )
      )
    }

    const operators = (Object.keys(_operators) || []).reduce((before, key) => {

      const operator = _operators[key]

      return Object.assign({}, before, {
        [key]: pipe(
          component => operator(component, makeComposite),
          component => map(component, component.kind || capitalize(key))
        )
      })
    }, {})

    return Object.assign(component, operators, {
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

  const parseCompositeOptions = pipe(
    coerce,
    tryCatch(parseChildren, err => {
      throw Object.assign(err, {
        message: `Invalid Component options: ${err.message}`
      })
    })
  )

  const makeComposite = (options = [], kind) => {

    const { has } = options = parseCompositeOptions(options)

    const combiners = Combiners(options)

    options.kind = kind || options.kind || `(${has.map(property('kind')).join('|')})`

    const Composite = sources => {

      return has.length > 1 || has[0] !== EmptyComponent
        ? mergeSinks(
          has.map(applyTo(sources)),
          combiners
        )
        : Object.keys(combiners).reduce((before, key) => Object.assign(before, {
          [key]: combiners[key]([])
        }), {})
    }

    return Component(Composite, options.kind)
  }

  Component.Empty = makeComposite.Empty = Component(EmptyComponent)
  Component.hasKey = makeComposite.hasKey = hasKey
  Component.log = makeComposite.log = log
  Component.coerce = makeComposite.coerce = coerce

  return makeComposite
}

module.exports = {
  default: makeComponent,
  makeComponent,
  defaultOperators,
  Empty
}