const RamdaPipe = require('ramda/src/pipe')

const pipe = (firstStep, ...steps) => (firstArg = void 0, ...args) => RamdaPipe(steps)(firstStep(firstArg, ...args))


module.exports = {
  default: pipe,
  pipe
}