const RamdaPipe = require('ramda/src/pipe')
const isEmpty = require('ramda/src/isEmpty')

const pipe = (firstStep, ...steps) => (firstArg = void 0, ...args) => {

  const firstResult = firstStep(firstArg, ...args)

  if (isEmpty(steps))
    return firstResult

  return RamdaPipe(...steps)(firstResult)
}


module.exports = {
  default: pipe,
  pipe
}