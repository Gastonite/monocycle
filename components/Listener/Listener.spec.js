const test = require('ava')
const { makeListener, WithListener } = require('./Listener')
const { makeComponent } = require('../../component')
const jsc = require("jsverify")
const assert = require('browser-assert')
const keys = require('ramda/src/keys')
const equals = require('ramda/src/equals')
const objOf = require('ramda/src/objOf')
const always = require('ramda/src/always')
const { Stream: $ } = require('xstream')
const { forall, property, nat, Options } = require('jsverify');
const { diagramArbitrary: diagramArb, withTime } = require('cyclejs-test-helpers');

const testsOptions = { tests: 100 }

test(`listens from a source`, t => {

  return withTime(Time => {

    const property = jsc.forall(diagramArb, diagramArb, (a, b) => {

      const streamA = Time.diagram(a)
      const streamB = Time.diagram(b)

      const withListener = WithListener([
        {
          from: (sinks, sources) => $.merge(sources.mySource, streamB),
          to: 'mySink'
        }
      ])

      const component = withListener()

      const sinks = component({ mySource: streamA })

      t.deepEqual(
        keys(sinks),
        ['mySink']
      )

      Time.assertEqual(
        $.merge(streamA, streamB),
        sinks.mySink,
        t.is.bind(t)
      )
      return true
    })

    jsc.assert(property, testsOptions)
  })()
})

test(`listens from a sink`, t => {

  return withTime(Time => {

    const property = jsc.forall(diagramArb, diagramArb, (a, b) => {

      const diagramA = Time.diagram(a)
      const diagramB = Time.diagram(b)

      const withListener = WithListener([
        {
          from: (sinks, sources) => $.merge(sinks.myPreviousSink, diagramB),
          to: 'mySink'
        }
      ])

      const component = withListener(always({
        myPreviousSink: diagramA
      }))

      const sinks = component()
      keys(sinks)

      t.deepEqual(
        keys(sinks),
        ['myPreviousSink', 'mySink']
      )

      Time.assertEqual(
        diagramA,
        sinks.myPreviousSink,
        t.is.bind(t)
      )

      Time.assertEqual(
        $.merge(diagramA, diagramB),
        sinks.mySink,
        t.is.bind(t)
      )
      return true
    })

    jsc.assert(property, testsOptions)
  })()
})

test(`listens from a sink (by key)`, t => {

  return withTime(Time => {

    const property = jsc.forall(diagramArb, (a) => {

      const diagramA = Time.diagram(a)

      const withListener = WithListener([
        {
          from: 'myPreviousSink',
          to: 'mySink'
        }
      ])

      const component = withListener(always({
        myPreviousSink: diagramA
      }))

      const sinks = component()

      t.deepEqual(
        keys(sinks),
        ['myPreviousSink', 'mySink']
      )

      Time.assertEqual(
        sinks.mySink,
        sinks.myPreviousSink,
        t.is.bind(t)
      )

      Time.assertEqual(
        diagramA,
        sinks.myPreviousSink,
        t.is.bind(t)
      )
      return true
    })

    jsc.assert(property, testsOptions)
  })()
})

test(`overrides a sink`, t => {

  return withTime(Time => {

    const property = jsc.forall(diagramArb, diagramArb, (a, b) => {

      const diagramA = Time.diagram(a)
      const diagramB = Time.diagram(b)

      const withListener = WithListener([
        {
          from: () => diagramB,
          to: 'mySink'
        }
      ])

      const component = withListener(() => ({ mySink: diagramA }))

      const sinks = component()

      t.deepEqual(
        keys(sinks),
        ['mySink']
      )

      Time.assertEqual(
        diagramB,
        sinks.mySink,
        t.is.bind(t)
      )
      return true
    })

    jsc.assert(property, testsOptions)
  })()
})

test(`combines with another sink`, t => {

  return withTime(Time => {

    const property = jsc.forall(diagramArb, diagramArb, (a, b) => {

      const diagramA = Time.diagram(a)
      const diagramB = Time.diagram(b)

      const withListener = WithListener([
        {
          from: () => diagramB,
          combine: $.merge,
          to: 'mySink'
        }
      ])

      const component = withListener(always({ mySink: diagramA }))

      const sinks = component()

      assert(equals(keys(sinks), ['mySink']), 'yo')

      Time.assertEqual(
        $.merge(diagramA, diagramB),
        sinks.mySink,
        t.is.bind(t)
      )
      return true
    })

    jsc.assert(property, testsOptions)
  })()
})