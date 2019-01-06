const test = require('ava')
const { Stream: $ } = require('xstream')
const { EmptyObject } = require('../../utilities/empty')
const ensureArray = require('ramda-adjunct/lib/ensureArray').default
const noop = require('ramda-adjunct/lib/noop').default
const always = require('ramda/src/always')
const keys = require('ramda/src/keys')
const { WithDynamic } = require('./Dynamic')


const dynamicMacro = (t, { args, sources, expectedSinks, testSinks }) => {

  const component = WithDynamic(...ensureArray(args))()

  const sinks = component(sources)

  t.deepEqual(keys(sinks), expectedSinks)

  return testSinks(t, sinks)
}

const emptyDynamicMacro = (t, options = {}) => dynamicMacro(t, {
  ...options,
  testSinks: (t, sinks) => $.combine(
    sinks.ga.map(() => t.fail()),
    sinks.bu.map(() => t.fail()),
    sinks.zo.map(() => t.fail()),
  )
})

emptyDynamicMacro.title = (title = '') => `Exposes empty sinks (${title})`


test('with no arguments', emptyDynamicMacro, {
  sources: { ga: 1, bu: 1, zo: 1 },
  expectedSinks: ['ga', 'bu', 'zo']
})

test(`when input is a function`, emptyDynamicMacro, {
  sources: { ga: 1, bu: 1, zo: 1 },
  expectedSinks: ['ga', 'bu', 'zo'],
  args: noop
})

test(`when 'from' returns nothing`, emptyDynamicMacro, {
  sources: { ga: 1, bu: 1, zo: 1 },
  expectedSinks: ['ga', 'bu', 'zo'],
  args: {
    from: noop,
  },
})

test(`when 'from' returns invalid value`, emptyDynamicMacro, {
  sources: { ga: 1, bu: 1, zo: 1 },
  expectedSinks: ['ga', 'bu', 'zo'],
  args: {
    from: always(42),
  },
})

test(`when component does not expose such sink`, emptyDynamicMacro, {
  sources: { ga: 1, bu: 1, zo: 1 },
  expectedSinks: ['ga', 'bu', 'zo'],
  args: {
    from: always(() => ({ meu: 42 })),
  },
})

test(`Allows to specify which sinks to expose`, t => {

  t.plan(2)
  const sources = { ga: 1, bu: 1, zo: 1 }

  const component = WithDynamic({
    SinksKeys: (...args) => {

      t.deepEqual(args, [sources])

      return ['mySink', 'bu']
    }
  })()

  const sinks = component(sources)

  t.deepEqual(keys(sinks), ['mySink', 'bu'])

  return $.combine(
    sinks.mySink.map(() => t.fail()),
    sinks.bu.map(() => t.fail()),
  )
})

test(`Exposes resolved component sinks`, t => {

  t.plan(3)
  const sources = { ga: 1, bu: 1, zo: 1 }

  const component = WithDynamic({
    from: (...args) => {

      t.deepEqual(args, [
        EmptyObject,
        sources
      ])

      return s => ({ bu: $.of(42) })
    }
  })()

  const sinks = component(sources)

  t.deepEqual(keys(sinks), ['ga', 'bu', 'zo'])

  return $.combine(
    sinks.ga.map(() => t.fail()),
    sinks.bu.map(x => t.is(x, 42)),
    sinks.zo.map(() => t.fail()),
  )
})
