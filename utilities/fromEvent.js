const { Stream: $ } = require('xstream')
const curry = require('ramda/src/curry')

const FromEvent = curry(({
  on = 'addEventListener',
  off = 'removeEventListener'
}, eventType, node) => {


  let listener
  return $.create({
    start: observer => {

      listener = event => observer.next(event)

      node[on](eventType, listener)
    },
    stop: () => node[off](eventType, listener)
  })
})

module.exports = {
  default: FromEvent,
  FromEvent
}