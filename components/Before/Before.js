const unless = require('ramda/src/unless')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const pipe = require('ramda/src/pipe')
const { makeEmptyObject } = require('../../utilities/empty')

const WithBefore = f => {

  return pipe(
    unless(isFunction, makeEmptyObject),
    component => {

      const Before = pipe(f, component)

      return Before
    }
  )
}

module.exports = {
  default: WithBefore,
  WithBefore
}