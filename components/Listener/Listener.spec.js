const { makeListener, WithListener } = require('./Listener')
const { makeComponent } = require('../../component')
const assert = require('browser-assert')
const keys = require('ramda/src/keys')
const pipe = require('ramda/src/pipe')
const equals = require('ramda/src/equals')
const objOf = require('ramda/src/objOf')
const always = require('ramda/src/always')
const { Stream: $ } = require('xstream')
const { forall, property, nat, Options } = require('jsverify');
const { diagramArbitrary, withTime } = require('cyclejs-test-helpers');

suite('Listener', () => {

  const Component = makeComponent()

  property('listens from sources',
    diagramArbitrary,
    diagramArbitrary,
    (a, b) => withTime(Time => {

      const d1 = Time.diagram(a)
      const d2 = Time.diagram(b)

      const withListener = WithListener({
        from: (sinks, sources) => $.merge(sources.mySource, d2),
        to: 'mySink'
      })

      const component = withListener()

      const sinks = component({ mySource: d1 })

      assert(equals(keys(sinks), ['mySink']), 'yo')

      Time.assertEqual(
        $.merge(d1, d2),
        sinks.mySink
      )
    })
  )

  property('listens from sinks',
    diagramArbitrary,
    diagramArbitrary,
    (a, b) => withTime(Time => {

      const diagramA = Time.diagram(a)
      const diagramB = Time.diagram(b)

      const withListener = WithListener({
        from: (sinks, sources) => $.merge(sinks.myPreviousSink, diagramB),
        to: 'mySink'
      })

      const component = withListener(always({
        myPreviousSink: diagramA
      }))

      const sinks = component()

      assert(equals(keys(sinks), ['myPreviousSink', 'mySink']), 'Unexpected sinks')

      Time.assertEqual(
        diagramA,
        sinks.myPreviousSink
      )

      Time.assertEqual(
        $.merge(diagramA, diagramB),
        sinks.mySink
      )
    })
  )

  property('listens from sinks (from string)',
    diagramArbitrary,
    (a) => withTime(Time => {

      const diagramA = Time.diagram(a)

      const withListener = WithListener({
        from: 'myPreviousSink',
        to: 'mySink'
      })

      const component = withListener(always({
        myPreviousSink: diagramA
      }))

      const sinks = component()

      assert(equals(keys(sinks), ['myPreviousSink', 'mySink']), 'Unexpected sinks')

      Time.assertEqual(
        sinks.mySink,
        sinks.myPreviousSink
      )

      Time.assertEqual(
        diagramA,
        sinks.myPreviousSink
      )
    })
  )


  property('overrides existing sinks',
    diagramArbitrary,
    diagramArbitrary,
    (a, b) => withTime(Time => {

      const diagramA = Time.diagram(a)
      const diagramB = Time.diagram(b)

      const withListener = WithListener({
        from: () => diagramB,
        to: 'mySink'
      })

      const component = withListener(() => ({ mySink: diagramA }))

      const sinks = component()

      assert(equals(keys(sinks), ['mySink']), 'yo')

      Time.assertEqual(
        diagramB,
        sinks.mySink
      )
    })
  )

  property('combines with existing sinks',
    diagramArbitrary,
    diagramArbitrary,
    (a, b) => withTime(Time => {

      const diagramA = Time.diagram(a)
      const diagramB = Time.diagram(b)

      const withListener = WithListener({
        from: () => diagramB,
        combine: $.merge,
        to: 'mySink'
      })

      const component = withListener(always({ mySink: diagramA }))

      const sinks = component()

      assert(equals(keys(sinks), ['mySink']), 'yo')

      Time.assertEqual(
        $.merge(diagramA, diagramB),
        sinks.mySink
      )
    })
  )

})