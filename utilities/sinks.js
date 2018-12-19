const { Stream: $ } = require('xstream')
const pipe = require('ramda/src/pipe')
const uniq = require('ramda/src/uniq')
const __ = require('ramda/src/__')
const reject = require('ramda/src/reject')
const contains = require('ramda/src/contains')
const filter = require('ramda/src/filter')
const map = require('ramda/src/map')
const has = require('ramda/src/has')
const concat = require('ramda/src/concat')
const reduce = require('ramda/src/reduce')


/**
 * Merges all sinks in the array
 * @param 'sinks' the sinks to be merged
 * @param 'exceptions' a dictionary of special channels, e.g. DOM
 * @return the new unified sinks 
 * 
 * 
 * {

  const emptySinks = pipe(
    reduce(pipe(
      (acc, sinks) => acc.concat(Object.keys(sinks)),
      uniq
    ), []),
    map(key => ({
      [key]: []
    })),
    reduce(Object.assign, {})
  )(allSinks)

  const combinedSinks = allSinks.reduce((before, curr) => {

    return pipe(
      Object.keys,
      map(key => ({ [key]: !curr[key] ? before[key] : [...before[key], curr[key]] })),
      reduce(Object.assign, {})
    )(before)
  }, emptySinks)

  return pipe(
    Object.keys,
    filter(name => Object.keys(exceptions).indexOf(name) === -1),
    map(s => [s, combinedSinks[s]]),
    map(([key, sinks]) => ({
      [key]: sinks.length === 1 ? sinks[0] : $.merge(...sinks)
    })),
    concat(
      Object.keys(exceptions)
        .filter(has(__, combinedSinks))
        .map(key => ({ [key]: exceptions[key](combinedSinks[key]) }))
    ),
    reduce(Object.assign, {})
  )(combinedSinks)
}
 */
const mergeSinks = (allSinks, exceptions = {}) => {

  const emptySinks = pipe(
    reduce((before, sinks) => before.concat(Object.keys(sinks)), []),
    uniq,
    map(key => ({ [key]: [] })),
    reduce(Object.assign, {})
  )(allSinks)

  const combinedSinks = allSinks.reduce((before, curr) => {
    return pipe(
      Object.keys,
      map(key => ({ [key]: !curr[key] ? before[key] : [...before[key], curr[key]] })),
      reduce(Object.assign, {})
    )(before)
  }, emptySinks)

  return pipe(

    //merge
    Object.keys,
    reject(contains(__, Object.keys(exceptions))),
    map(key => ({
      [key]: combinedSinks[key].length === 1 ? combinedSinks[key][0] : $.merge(...combinedSinks[key])
    })),

    //add specials
    concat(__,
      pipe(
        Object.keys,
        filter(has(__, combinedSinks)),
        map(key => ({ [key]: exceptions[key](combinedSinks[key]) })),
      )(exceptions)
    ),

    reduce(Object.assign, {}),
  )(combinedSinks)
}

const extractSinks = (sinks$, driverNames) => {
  return reduce((acc, key) => ({
    ...acc,
    [key]: sinks$
      .map(s => s[d])
      .filter(b => !!b)
      .flatten()
  }), {}, driverNames)
}

module.exports = {
  extractSinks,
  mergeSinks
}