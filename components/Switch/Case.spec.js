const test = require('ava')
const { Case } = require('./Case')
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const pipe = require('ramda/src/pipe')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const { withFunctionTest } = require('../../utilities/WithFactoryMacro')
const { ensurePlainObj } = require('../../utilities/ensurePlainObj')


const withCaseTest = pipe(

  test => t => {

    const { testFunction } = t.context

    const testCaseFunction = testFunction(Case)

    const testCase = pipe(
      ensurePlainObj,
      over(lensProp('args'), ensureArray),
      over(lensProp('caseArgs'), ensureArray),
      ({ args, caseArgs, expected }) => {

        const caseA = testCaseFunction(args)

        t.true(isFunction(caseA))

        const returned = caseA(...caseArgs)

        t.is(returned, expected)

        return returned
      }
    )

    testCase.nbTests = testFunction.nbTests + 2

    return test(t, testCase)
  },
  withFunctionTest
)


test('Case: creates a resolve function from a case object', withCaseTest((t, testCase) => {

  t.plan((testCase.nbTests * 3) + 2)

  const isGa = x => x === 'GA'

  testCase({
    args: [],
    caseArgs: [],
    expected: false
  })

  testCase({
    args: {
      resolve: x => {

        t.is(x, 'GA')

        return isGa(x)
      },
      value: 'zo'
    },
    caseArgs: 'GA',
    expected: 'zo'
  })

  testCase({
    args: {
      resolve: x => {

        t.is(x, 'B')

        return x === 'A'
      },
      value: 'bu'
    },
    caseArgs: 'B',
    expected: false
  })
}))

test(`Case: calls 'value' with 'resolve' result (when it's a function)`, withCaseTest((t, testCase) => {

  t.plan((testCase.nbTests * 2) + 3)

  const startsWithG = x => x.match(/^G(.*)/)

  testCase({
    args: {
      resolve: x => {

        t.is(x, 'GA')

        return startsWithG(x)
      },
      value: matches => {

        t.deepEqual(
          matches,
          startsWithG('GA')
        )

        return 'zo'
      }
    },
    caseArgs: 'GA',
    expected: 'zo'
  })

  testCase({
    args: {
      resolve: x => {

        t.is(x, 'BU')

        return startsWithG(x)
      },
      value: t.fail
    },
    caseArgs: 'BU',
    expected: false
  })
}))