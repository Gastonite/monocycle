const { EmptyObject } = require('./utilities/empty')
const when = require('ramda/src/when')
const over = require('ramda/src/over')
const applyTo = require('ramda/src/applyTo')
const map = require('ramda/src/map')
const filter = require('ramda/src/filter')
const ifElse = require('ramda/src/ifElse')
const unless = require('ramda/src/unless')
const lensProp = require('ramda/src/lensProp')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { mergeSinks } = require('cyclejs-utils')
const prop = require('ramda/src/prop')
const both = require('ramda/src/both')
const pipe = require('ramda/src/pipe')
const identical = require('ramda/src/identical')
const concat = require('ramda/src/concat')
const compose = require('ramda/src/compose')
const complement = require('ramda/src/complement')
const always = require('ramda/src/always')
const lt = require('ramda/src/lt')
const merge = require('ramda/src/merge')
const isEmpty = require('ramda/src/isEmpty')
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const log = require('./utilities/log').Log('Component')
const { ensurePlainObj } = require('./utilities/ensurePlainObj')
const { coerce } = require('./utilities/coerce')
const different = compose(complement, identical)

const isComponent = both(isFunction, prop('isComponent'))
const isComposite = both(isFunction, prop('isComposite'))


const makeComponent = pipe(
  ensurePlainObj,
  over(lensProp('makeDefault'), unless(isFunction,
    always(always(EmptyObject))
  )),
  over(lensProp('Combiners'), unless(isFunction,
    always(EmptyObject)
  )),
  options => {

    const {
      Combiners,
      makeDefault,
    } = options

    // Creates a component from a function
    const _create = _component => {

      _component

      const component = sources => _component(sources)

      return Object.assign(component, {
        ..._component,
        isComponent: true,
        has: [_component],
        map: f => _create(f(component)),
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
              Component
            ),
          ),
          _create
        )(others)
      })
    }

    const Component = pipe(
      coerce,
      options => {

        // Creates a composite component from multiple components
        const _Composite = components => {

          const combiners = Combiners(options)

          const composite = sources => mergeSinks(
            components
              .filter(complement(identical(Component.Empty)))
              .map(applyTo(sources)),
            combiners
          )

          composite.has = components
          composite.isComposite = true

          return _create(composite)
        }

        return pipe(
          ensureArray,
          map(unless(isFunction, makeDefault)),
          filter(different(Component.Empty)),
          map(_create),
          ifElse(
            isEmpty,
            always(Component.Empty),
            _Composite
          )
        )(options.has)
      }
    )




    return Object.assign(Component, {
      Empty: _create(EmptyObject),
      coerce,
      isComponent,
      isComposite
    })
  }
)


module.exports = {
  default: makeComponent,
  makeComponent,
  isComponent,
  isComposite
}