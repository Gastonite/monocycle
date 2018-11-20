
const { forall, assert, property, nat, Options } = require('jsverify');
const concat = require('ramda/src/concat');
const identity = require('ramda/src/identity');
const equals = require('ramda/src/equals');
const map = require('ramda/src/map');
const prop = require('ramda/src/prop');
const jsc = require('jsverify');
// const { Cycle } = require('./component2');
const { makeComponent } = require('./component');
// const htmlLooksLike = require('html-looks-like');
// const { Counter } = require('./index');
// const toHtml = require('snabbdom-to-html'); //snabbdom-to-html's typings are broken
// const prettifyXml = require('prettify-xml'); //snabbdom-to-html's typings are broken
// const { Stream: $ } = require('xstream');
// const { mockDOMSource, VNode } = require('@cycle/dom');
// const { withState } = require('@cycle/state');
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const pipe = require('ramda/src/pipe')
const when = require('ramda/src/when')
const apply = require('ramda/src/apply')
const filter = require('ramda/src/filter')
const both = require('ramda/src/both')
const keys = require('ramda/src/keys')
const uniq = require('ramda/src/uniq')
const propEq = require('ramda/src/propEq')
const always = require('ramda/src/always')
const flatten = require('ramda/src/flatten')
const reduce = require('ramda/src/reduce')
const path = require('ramda/src/path')
const { diagramArbitrary, withTime } = require('cyclejs-test-helpers');
const { Stream: $ } = require('xstream');

const collectKinds = pipe(
  prop('kind'),
  ensureArray,
  filter(isFunction),
  map(pipe(
    when(
      prop('isComponent'),
      c => collectKinds(c)
    )
  )),
  flatten
)



const isEquivalent1 = (x, y) => {
  return equals(
    collectKinds(x),
    collectKinds(y)
  )//?
}

const isEquivalent2 = (x, y) => {
  return equals(
    collectKinds(x),
    collectKinds(y)
  )//?
}


// property('isEquivalent1', () => {
//   return isEquivalent1(
//     c1.concat(c2).concat(c3),
//     c1.concat(c2.concat(c3))
//   )
// })

suite('Component', () => {

  const Component = makeComponent()

  const diagramsArb = jsc.dict(diagramArbitrary)

  suite('Monoid laws', () => {

    property('right identity', diagramsArb, diagrams => withTime(Time => {

      const component = pipe(
        map(Time.diagram),
        always,
        Component
      )(diagrams)

      const sinksA = component.concat(Component.Empty)()
      const sinksB = component()

      uniq(concat(keys(sinksA), keys(sinksB)))
        .forEach(key => {

          Time.assertEqual(
            sinksA[key],
            sinksB[key]
          )
        })
    }))

    property('left identity', diagramsArb, diagrams => withTime(Time => {

      const component = pipe(
        map(Time.diagram),
        always,
        Component
      )(diagrams)

      const composite = Component.Empty.concat(component)

      const sinksA = composite()
      const sinksB = component()

      uniq(concat(keys(sinksA), keys(sinksB)))
        .forEach(key => {

          Time.assertEqual(
            sinksA[key],
            sinksB[key]
          )
        })
    }))

  })

  suite('Semigroup laws', () => {

    property('associativity', diagramsArb, diagramsArb, diagramsArb, (a, b, c) => withTime(Time => {

      const componentA = pipe(
        map(Time.diagram),
        always,
        Component
      )(a)

      const componentB = pipe(
        map(Time.diagram),
        always,
        Component
      )(b)

      const componentC = pipe(
        map(Time.diagram),
        always,
        Component
      )(c)

      const compositeA = componentA.concat(componentB).concat(componentC)
      const compositeB = componentA.concat(componentB.concat(componentC))

      const sinksA = compositeA()
      const sinksB = compositeB()

      concat(keys(sinksA), keys(sinksB))
        .forEach(key => {

          Time.assertEqual(
            sinksA[key],
            sinksB[key]
          )
        })
    }))

  })

  suite('Functor laws', () => {

    property('identity', diagramsArb, diagrams => withTime(Time => {

      const component = pipe(
        map(Time.diagram),
        always,
        Component
      )(diagrams)

      const sinksA = component.map(identity)()
      const sinksB = component()

      uniq(concat(keys(sinksA), keys(sinksB)))
        .forEach(key => {

          Time.assertEqual(
            sinksA[key],
            sinksB[key]
          )
        })
    }))

    property('composition',
      diagramsArb,
      diagramsArb,
      diagramsArb,
      (a, b, c) => withTime(Time => {

        const component1 = pipe(
          map(Time.diagram),
          always,
          Component
        )(a)

        const component2 = pipe(
          map(Time.diagram),
          always,
          Component
        )(b)

        const component3 = pipe(
          map(Time.diagram),
          always,
          Component
        )(c)


        const f = component => sources => ({
          ...component(sources),
          ...component2(sources),
        })

        const g = component => sources => ({
          ...component(sources),
          ...component3(sources),
        })

        const composite1 = component1.map(f).map(g)
        const composite2 = component1.map(x => g(f((x))))

        const sinksA = composite1()
        const sinksB = composite2()

        uniq(concat(keys(sinksA), keys(sinksB)))
          .forEach(key => {

            Time.assertEqual(
              sinksA[key],
              sinksB[key]
            )
          })
      }))
  })

})

