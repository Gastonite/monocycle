const WithFactoryMacro = factory => test => (t, args = [], ...others) => test(t, factory(...args), ...others)
const isFunction = require('ramda-adjunct/lib/isFunction').default
const isPlainObj = require('ramda-adjunct/lib/isPlainObj').default
const { pipe } = require('./pipe')
const when = require('ramda/src/when')
const keys = require('ramda/src/keys')
const merge = require('ramda/src/merge')
const objOf = require('ramda/src/objOf')
const compose = require('ramda/src/compose')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const { EmptyArray } = require('./empty')
const { ensurePlainObj } = require('./ensurePlainObj')
const { ensureArray } = require('./ensureArray')


const withFunctionTest = (test = noop) => (t, ...rest) => {

  const testFunction = f => args => pipe(
    ensureArray,
    args => {

      t.true(isFunction(f))

      return f(...args)
    }
  )(args)

  testFunction.nbTests = 1

  t.context.testFunction = testFunction

  return test(t, ...rest)
}

const WithComponentTest = makeBehavior => {

  const withComponentTest = compose(
    withFunctionTest,

    test => (t, options, ...rest) => {

      const { testFunction } = t.context

      const testBehaviorFactory = testFunction(makeBehavior)

      const defaultOptions = pipe(
        when(isFunction, objOf('before')),
        ensurePlainObj,
        over(lensProp('before'), ensureArray),
        over(lensProp('expectedSinks'), ensureArray)
      )(options)

      const testComponent = (input, options) => {

        const {
          before = [],
          expectedSinks,
        } = merge(defaultOptions, ensurePlainObj(options))

        const behavior = testBehaviorFactory(input)

        const component = testFunction(behavior)(before)

        return sources => {

          const sinks = component(sources)

          t.true(isPlainObj(sinks))

          t.deepEqual(
            keys(sinks)/*?*/,
            expectedSinks
          )

          return sinks
        }
      }

      testComponent.nbTests = (testFunction.nbTests * 2) + 2

      t.context.testComponent = testComponent

      return test(t, options, ...rest)
    },
    // test => (t, options) => {

    //   keys(t.context)//?
    //   const { testFunction } = t.context

    //   const {
    //     before = [],
    //     expectedSinks,
    //   } = pipe(
    //     when(isFunction, objOf('before')),
    //     ensurePlainObj,
    //     over(lensProp('before'), ensureArray),
    //     over(lensProp('expectedSinks'), pipe(
    //       defaultTo([]),
    //       ensureArray
    //     ))
    //   )(options)

    //   t.true(isFunction(test))

    //   const testComponent = (...args) => {

    //     args
    //     const behavior = testFunction(args)

    //     t.true(isFunction(behavior))

    //     const component = behavior(...ensureArray(before))

    //     t.true(isFunction(component))

    //     return sources => {

    //       const sinks = component(sources)

    //       t.true(isPlainObj(sinks))

    //       t.deepEqual(
    //         keys(sinks)/*?*/,
    //         expectedSinks/*?*/
    //       )

    //       return sinks
    //     }
    //   }

    //   testComponent.nbTests = 6

    //   t.context.testComponent = testComponent

    //   return test(t, {
    //     before,
    //     expectedSinks
    //   })
    // },
    // test => (t, ...args) => {

    //   t.context//?

    //   args
    //   return test(t, ...args)
    // }
  )

  return withComponentTest
}



// test => t => {

//   const { testFunction } = t.context

//   const testCase = pipe(
//     ensurePlainObj,
//     over(lensProp('args'), ensureArray),
//     over(lensProp('caseArgs'), ensureArray),
//     ({ args, caseArgs, expected }) => {

//       const caseA = testFunction(args)

//       t.true(isFunction(caseA))

//       const returned = caseA(...caseArgs)

//       t.is(returned, expected)

//       return returned
//     }
//   )

//   testCase.nbTests = testFunction.nbTests + 2

//   return test(t, testCase)
// }

module.exports = {
  default: WithFactoryMacro,
  WithFactoryMacro,
  WithComponentTest,
  withFunctionTest
}