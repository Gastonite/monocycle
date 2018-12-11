const jsc = require('jsverify')
const test = require('ava')
const $ = require('xstream').default
const { pipe } = require('../../utilities/pipe')
const { EmptyObject } = require('../../utilities/empty')
const { ensurePlainObj } = require('../../utilities/ensurePlainObj')
const { WithComponentTest } = require('../../utilities/WithFactoryMacro')
const noop = require('ramda-adjunct/lib/noop').default
const { makeComponent } = require('../../component')
const always = require('ramda/src/always')
const compose = require('ramda/src/compose')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const keys = require('ramda/src/keys')
const unless = require('ramda/src/unless')
const { WithDynamic } = require('./Dynamic')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { diagramArbitrary: diagramArb, withTime } = require('cyclejs-test-helpers')

const Component = makeComponent()

const withDynamicTest = WithComponentTest(WithDynamic)


test('default: returns empty component', withDynamicTest((t) => {

  return withTime(Time => {

    Time
    const { testComponent } = t.context

    t.plan(testComponent.nbTests)

    const component = testComponent()

    component({ Time })

    return true
  })()

}), { expectedSinks: ['Time'] })

test('default: exposes sinks whose key exist in sources', withDynamicTest(t => {
  return withTime(Time => {

    const { testComponent } = t.context

    const fail = t.fail.bind(t)

    t.plan(testComponent.nbTests)

    const component = testComponent()

    const sources = { Time, ga: 1, bu: 1, zo: 1 }

    const sinks = component(sources)

    return $.combine(
      sinks.ga.map(fail),
      sinks.bu.map(fail),
      sinks.zo.map(fail),
    )
  })()

}), { expectedSinks: ['Time', 'ga', 'bu', 'zo'] })

test('SinksKeys: select specific sinks', withDynamicTest((t, options) => {
  return withTime(Time => {

    const { testComponent } = t.context

    const fail = t.fail.bind(t)

    const component = testComponent({
      SinksKeys: (...args) => {

        t.deepEqual(args, [sources])

        return ['mySink', 'b']
      }
    })

    const sources = { Time, a: 1, b: 1 }
    const sinks = component(sources)

    return $.combine(
      sinks.mySink.map(fail),
      sinks.b.map(fail),
    )
  })()

}), { expectedSinks: ['mySink', 'b'] })

const withFromMethodTest = compose(
  withDynamicTest,
  test => (t, options) => {

    const { testComponent } = t.context
    const { before = [] } = options

    const testFromMethod = pipe(
      ensurePlainObj,
      over(lensProp('from'), pipe(
        unless(isFunction, (x) => { throw new Error(`'from' must be a function ${keys(x)}`) })
      )),
      ({ from, sources }) => {


        const component = testComponent({
          from: (...args) => {

            t.deepEqual(args, [
              before[0] || EmptyObject,
              sources
            ])

            return from(...args)
          }
        })

        return component(sources)
      }
    )

    testFromMethod.nbTests = testComponent.nbTests + 1
    t.context.testFromMethod = testFromMethod

    return test(t)
  }
)

test(`exposes empty sinks when 'from' returns nothing`, withFromMethodTest(t => {
  return withTime(Time => {

    const { testFromMethod } = t.context

    const fail = t.fail.bind(t)

    t.plan(testFromMethod.nbTests)

    const sinks = testFromMethod({
      sources: { Time, ga: 1, bu: 1, zo: 1 },
      from: noop
    })

    return $.combine(
      sinks.ga.map(fail),
      sinks.bu.map(fail),
      sinks.zo.map(fail),
    )
  })()

}), { expectedSinks: ['Time', 'ga', 'bu', 'zo'] })

test(`exposes empty sinks when 'from' returns invalid`, withFromMethodTest(t => {
  return withTime(Time => {

    const { testFromMethod } = t.context

    const fail = t.fail.bind(t)

    t.plan(testFromMethod.nbTests)

    const sinks = testFromMethod({
      sources: { Time, ga: 1, bu: 1, zo: 1 },
      from: always(42)
    })

    return $.combine(
      sinks.ga.map(fail),
      sinks.bu.map(fail),
      sinks.zo.map(fail),
    )
  })()

}), { expectedSinks: ['Time', 'ga', 'bu', 'zo'] })

test(`exposes empty sinks when 'from' returns component`, withFromMethodTest(t => {
  const { testFromMethod } = t.context

  t.plan(testFromMethod.nbTests)

  return withTime(Time => {

    const property = jsc.forall(diagramArb, (a) => {

      const streamA = Time.diagram(a)

      const sinks = testFromMethod({
        SinksKeys: () => ['bu'],
        sources: { Time, ga: 1, bu: 1, zo: 1 },
        from: always(Component(() => ({
          bu: streamA.compose(Time.debounce(0)),
          meu: $.of(42),
        })))
      })

      Time.assertEqual(
        sinks.ga,
        Time.diagram('|')
      )
      Time.assertEqual(
        sinks.bu,
        streamA,
      )
      Time.assertEqual(
        sinks.zo,
        Time.diagram('|')
      )

      return true
    })

    jsc.assert(property, { tests: 1 })

  })()
}), { expectedSinks: ['Time', 'ga', 'bu', 'zo'] })

test(`exposes empty sinks when 'from' returns component stream`, withFromMethodTest(t => {

  const { testFromMethod } = t.context

  const fail = t.fail.bind(t)

  t.plan(testFromMethod.nbTests + 1)

  const sinks = testFromMethod({
    sources: { ga: 1, bu: 1, zo: 1 },
    from: always($.of(Component(() => ({
      bu: $.of('8888'),
      meu: $.of(-69)
    }))))
  })

  return $.combine(
    sinks.ga.map(fail),
    sinks.bu.map(x => t.is(x, '8888')),
    sinks.zo.map(fail),
  )
}), { expectedSinks: ['ga', 'bu', 'zo'] })

