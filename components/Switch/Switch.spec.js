const test = require('ava')
const $ = require('xstream').default
// const { pipe } = require('../../utilities/pipe')
// const { WithDynamic } = require('../Dynamic')
const { WithSwitch, Case } = require('./Switch')
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const noop = require('ramda-adjunct/lib/noop').default
const { makeComponent, isComponent } = require('../../component')
const T = require('ramda/src/T')
const ifElse = require('ramda/src/ifElse')
const defaultTo = require('ramda/src/defaultTo')
const compose = require('ramda/src/compose')
const pipe = require('ramda/src/pipe')
const over = require('ramda/src/over')
const unless = require('ramda/src/unless')
const toString = require('ramda/src/toString')
const lensProp = require('ramda/src/lensProp')
const always = require('ramda/src/always')
const keys = require('ramda/src/keys')
const { WithComponentTest, withFunctionTest } = require('../../utilities/WithFactoryMacro')
const { ensurePlainObj } = require('../../utilities/ensurePlainObj')


const withSwitchTest = WithComponentTest(WithSwitch)

test('Exposes resolved component sinks', withSwitchTest(t => {

  const { testComponent } = t.context

  t.plan(testComponent.nbTests + 4)

  const sources = { mySource: $.of(43) }

  const sinks = testComponent({
    SinksKeys: always(['ga']),
    from: (...args) => {

      t.deepEqual(args, [{}, sources])

      return sources.mySource
    },
    resolve: x => {

      t.is(x, 43)

      return x > 42 && (() => ({ ga: $.of('yay') }))
    },
    Default: t.fail
  })(sources)

  t.deepEqual(keys(sinks), ['ga'])

  return sinks.ga.map(x => {

    t.is(x, 'yay')
  })
}), { expectedSinks: ['ga'] })


test('Exposes default component sinks', withSwitchTest(t => {

  const { testComponent } = t.context

  t.plan(testComponent.nbTests + 5)

  const sources = { mySource: $.of(41) }

  const sinks = testComponent({
    SinksKeys: always(['ga']),
    from: (...args) => {

      t.deepEqual(args, [{}, sources])

      return args[1].mySource
    },
    resolve: x => {

      t.is(x, 41)

      return x > 42 && (() => ({ ga: $.of('yay') }))
    },
    Default: x => {

      x
      t.is(x, 41)

      return () => ({ ga: $.of('default x:' + x) })
    }
  })(sources)

  t.deepEqual(keys(sinks), ['ga'])

  return sinks.ga.map(x => {

    t.is(x, 'default x:41')
  })
}), { expectedSinks: ['ga'] })

test(`Creates 'resolve' from case object`, withSwitchTest(t => {

  const { testComponent } = t.context

  t.plan(testComponent.nbTests + 3)

  const sources = { mySource: $.of(100) }

  const { ga } = testComponent({
    SinksKeys: always(['ga']),
    from: (...args) => {

      t.deepEqual(args, [{}, sources])

      return args[1].mySource
    },
    resolve: Case({
      resolve: x => {

        t.is(x, 100)

        return x > 42
      },
      value: always(() => ({ ga: $.of('yay') }))
    }),
    Default: t.fail
  })(sources)

  return ga.map(x => {

    t.is(x, 'yay')
  })
}), { expectedSinks: ['ga'] })



const casesMacro = (t, Spec) => {

  // console.log('input', input)
  const {
    sources,
    assertions,
    expectedSinks,
    merge,
    Default
  } = Spec(t)

  // const { testComponent } = t.context

  // t.plan(testComponent.nbTests + 1 + 3 + 3 )
  // const testCases = ({ sources, assertions } = {}) => {

  // t.is(eval(input), expected)


  const component = WithSwitch({
    SinksKeys: always(['ga', 'bu', 'zo']),
    merge,
    from: (...args) => {

      t.deepEqual(args, [{}, sources])

      return args[1].mySource
    },
    resolve: [
      Case({
        resolve: x => {

          assertions.resolve[0](x)

          return x > 42
        },
        value: always(() => ({ ga: $.of('yay') }))
      }),
      Case({
        resolve: x => {

          assertions.resolve[1](x)

          return x % 2 === 0
        },
        value: isEven => {

          return () => ({ bu: $.of('isEven:' + isEven) })
        }
      }),
      Case({
        resolve: x => {

          assertions.resolve[2](x)

          return toString(x).match(/^4(.*)/)
        },
        value: matches => () => ({ zo: $.of('matches:' + matches[1]) })
      }),
    ],
    Default: x => {

      assertions.default(x)
      return Default(x)
    }
  })()

  t.true(isComponent(component))

  const sinks = component(sources)

  t.true(isPlainObj(sinks))

  t.deepEqual(keys(sinks), expectedSinks)

  return $.merge(
    sinks.ga.map(assertions.sinks[0]),
    sinks.bu.map(assertions.sinks[1]),
    sinks.zo.map(assertions.sinks[2]),
  )
}

casesMacro.title = (title = '', input, expected) => `'resolve' accepts case array` + (title ? ' (' + title + ')' : '')
casesMacro.tests = 4

test(casesMacro, t => {

  t.plan(casesMacro.tests + 10)

  return {
    sources: { mySource: $.of(41) },
    expectedSinks: ['ga', 'bu', 'zo'],
    assertions: {
      resolve: [
        x => t.is(x, 41),
        x => t.is(x, 41),
        x => t.is(x, 41),
      ],
      default: x => t.fail(),
      sinks: [
        x => t.fail(),
        x => t.fail(),
        x => t.is(x, 'matches:1'),
      ]
    }
  }
})

test('Merges all resolved values', casesMacro, t => {

  t.plan(casesMacro.tests + 12)

  return {
    sources: { mySource: $.of(44) },
    expectedSinks: ['ga', 'bu', 'zo'],
    merge: true,
    assertions: {
      resolve: [
        x => t.is(x, 44),
        x => t.is(x, 44),
        x => t.is(x, 44),
      ],
      default: x => t.fail(),
      sinks: [
        x => t.is(x, 'yay'),
        x => t.is(x, 'isEven:true'),
        x => t.is(x, 'matches:4'),
      ]
    }
  }
})

test(`Stops iterating other cases when a case resolves`, casesMacro, t => {
  t.plan(casesMacro.tests + 4)

  return {
    sources: { mySource: $.of(43) },
    expectedSinks: ['ga', 'bu', 'zo'],
    assertions: {
      resolve: [
        x => t.is(x, 43),
        x => t.fail(),
        x => t.fail(),
      ],
      default: x => t.fail(),
      sinks: [
        x => t.is(x, 'yay'),
        x => t.fail(),
        x => t.fail(),
      ]
    }
  }
})

test(`Exposes the default component when no case resolves`, casesMacro, t => {
  t.plan(casesMacro.tests + 14)

  return {
    sources: { mySource: $.of(39) },
    expectedSinks: ['ga', 'bu', 'zo'],
    Default: x => () => ({ ga: $.of('a'), zo: $.of('b') }),
    assertions: {
      resolve: [
        x => t.is(x, 39),
        x => t.is(x, 39),
        x => t.is(x, 39)
      ],
      default: x => t.is(x, 39),
      sinks: [
        x => t.is(x, 'a'),
        x => t.fail(),
        x => t.is(x, 'b'),
      ]
    }
  }
})
