const { EmptyObject, makeEmptyObject } = require('./utilities/empty')
const { pipe } = require('./utilities/pipe')
const when = require('ramda/src/when')
const reject = require('ramda/src/reject')
const applyTo = require('ramda/src/applyTo')
const arrayOf = require('ramda/src/of')
const filter = require('ramda/src/filter')
const ifElse = require('ramda/src/ifElse')
const unless = require('ramda/src/unless')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { mergeSinks } = require('cyclejs-utils')
const lt = require('ramda/src/lt')
const prop = require('ramda/src/prop')
const identity = require('ramda/src/identity')
const both = require('ramda/src/both')
const RamdaPipe = require('ramda/src/pipe')
const identical = require('ramda/src/identical')
const __ = require('ramda/src/__')
const concat = require('ramda/src/concat')
const compose = require('ramda/src/compose')
const complement = require('ramda/src/complement')
const always = require('ramda/src/always')
const apply = require('ramda/src/apply')
const merge = require('ramda/src/merge')
const lensProp = require('ramda/src/lensProp')
const over = require('ramda/src/over')
const isEmpty = require('ramda/src/isEmpty')
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const { assign } = require('./utilities/assign')
const { coerce } = require('./utilities/coerce')
const { ensurePlainObj } = require('./utilities/ensurePlainObj')
const different = compose(complement, identical)
const log = require('./utilities/log').Log('Component')
const map = require('ramda/src/map')


const makeComponent = pipe(
  ensurePlainObj,
  over(lensProp('Default'), unless(isFunction, always(makeEmptyObject))),
  over(lensProp('Combiners'), unless(isFunction, makeEmptyObject)),
  over(lensProp('operators'), ensurePlainObj),
  ({ Default, Combiners, operators }) => {

    console.log('makeComponent()')

    // Creates a component from a function
    const Component = _component => {

      const component = sources => _component(sources)

      const _map = f => Component(f(component))

      return Object.assign(component, {
        ..._component,
        ...map(makeBehavior => pipe(
          makeBehavior,
          _map
        ), operators),
        isComponent: true,
        has: [_component],
        map: _map,
        concat: (others, options = {}) => pipe(
          ensureArray,
          filter(isFunction),
          ifElse(
            isEmpty,
            always(component),
            pipe(
              concat([component]),
              coerce,
              when(always(isPlainObj(options)), merge(options)),
              Composite
            ),
          ),
          Component
        )(others)
      })
    }

    // Creates a composite component from 0 or * components
    const Composite = pipe(
      coerce,
      options => pipe(
        map(unless(isFunction, Default)),
        reject(identical(Composite.Empty)),
        map(Component),
        ifElse(isEmpty,
          always(Composite.Empty),
          pipe(
            has => {

              const composite = Component(sources => {

                return pipe(
                  map(applyTo(sources)),
                  arrayOf,
                  concat(__, [Combiners(options)]),
                  apply(mergeSinks)
                )(has)
              })

              composite.isComposite = true
              composite.has = has

              return composite
            }
          )
        )
      )(options.has)
    )

    Composite.Empty = Component(EmptyObject)

    return Composite
  }
)

module.exports = {
  default: makeComponent,
  makeComponent,
  isComponent: both(isFunction, prop('isComponent')),
  isComposite: both(isFunction, prop('isComposite')),
}