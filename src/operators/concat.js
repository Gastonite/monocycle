import assert from 'browser-assert'
import isFunction from "lodash.isfunction"
import uniq from "ramda/src/uniq"
import identity from "ramda/src/identity"

const ConcatOperator = ({
  defaultCombiner = identity,
  combiners: defaultCombiners = {}
} = {}) => {

  const concatOperator = (otherFactory = Component.empty, otherCombiners = {}) => {

    const combiners = Object.assign({}, defaultCombiners, otherCombiners)
  
    const combinersKeys = Object.keys(combiners)

    assert(combinersKeys.map(key => combiners[key]).every(isFunction),
      `'combiners' only accepts functions`)

    return factory => sources => {

      const sinks = factory(sources)
      const otherSinks = otherFactory(sources)

      const allKeys = uniq(
        Object.keys(sinks)
          .concat(Object.keys(otherSinks))
      )
      // console.log('Composite()', { allKeys, combiners, otherCombiners })

      return allKeys.reduce((before, key) => {

        const combiner = combiners[key] || defaultCombiner
        const sink = sinks[key]
        const otherSink = otherSinks[key]
        const isConflict = Boolean(sink && otherSink)

        // console.log('Composite[' + key + ']', { isConflict })

        return Object.assign({}, before, {
          [key]: isConflict
            ? combiner(sink, otherSink)
            : otherSink || sink
        })

      }, sinks)
    }
  }

  return concatOperator
}

export default ConcatOperator