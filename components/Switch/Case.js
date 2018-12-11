const { ensurePlainObj } = require('../../utilities/ensurePlainObj')
const isFunction = require('ramda-adjunct/lib/isFunction').default
const noop = require('ramda-adjunct/lib/noop').default
const when = require('ramda/src/when')
const unless = require('ramda/src/unless')
const always = require('ramda/src/always')
const lensProp = require('ramda/src/lensProp')
const over = require('ramda/src/over')
const defaultTo = require('ramda/src/defaultTo')
const T = require('ramda/src/T')
const pipe = require('ramda/src/pipe')
const { isComponent } = require('../../component')


const Case = pipe(
  ensurePlainObj,
  over(lensProp('resolve'), unless(isFunction, always(noop))),
  over(lensProp('value'), pipe(
    defaultTo(T),
    unless(isFunction, always),
    when(isComponent, always())
  )),
  ({ resolve, value }) => {

    return pipe(
      resolve,
      x => {
        return x && value(x) || false
      },
    )
  }
)

module.exports = {
  default: Case,
  Case
}
