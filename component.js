const { EmptyObject, makeEmptyObject } = require('./utilities/empty')
const when = require('ramda/src/when')
const reject = require('ramda/src/reject')
const applyTo = require('ramda/src/applyTo')
const map = require('ramda/src/map')
const arrayOf = require('ramda/src/of')
const filter = require('ramda/src/filter')
const ifElse = require('ramda/src/ifElse')
const unless = require('ramda/src/unless')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { mergeSinks } = require('cyclejs-utils')
const lt = require('ramda/src/lt')
const prop = require('ramda/src/prop')
const both = require('ramda/src/both')
const pipe = require('ramda/src/pipe')
const identical = require('ramda/src/identical')
const __ = require('ramda/src/__')
const concat = require('ramda/src/concat')
const compose = require('ramda/src/compose')
const complement = require('ramda/src/complement')
const always = require('ramda/src/always')
const apply = require('ramda/src/apply')
const merge = require('ramda/src/merge')
const isEmpty = require('ramda/src/isEmpty')
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const { assign } = require('./utilities/assign')
const { coerce } = require('./utilities/coerce')
const different = compose(complement, identical)
// const log = require('./utilities/log').Log('Component')

const makeComponent = () => {

  // Creates a component from a function
  const Component = _component => {

    const component = sources => _component(sources)

    return Object.assign(component, {
      ..._component,
      isComponent: true,
      has: [_component],
      map: f => Component(f(component)),
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
      map(unless(isFunction, Composite.makeDefault)),
      filter(different(Composite.Empty)),
      map(Component),
      ifElse(isEmpty,
        always(Composite.Empty),
        pipe(
          reject(identical(Composite.Empty)),
          components => sources => pipe(
            map(applyTo(sources)),
            arrayOf,
            concat(__, [Composite.Combiners(options)]),
            apply(mergeSinks)
          )(components),
          assign({
            isComposite: true
          }),
          Component
        )
      )
    )(options.has)
  )

  return Object.assign(Composite, {
    Empty: Component(EmptyObject),
    makeDefault: makeEmptyObject,
    Combiners: EmptyObject
  })
}

const Component = makeComponent()


module.exports = {
  default: Component,
  Component,
  makeComponent,
  isComponent: both(isFunction, prop('isComponent')),
  isComposite: both(isFunction, prop('isComposite')),
}