const S = require('sanctuary')

const pipe = (firstStep, ...steps) => (...args) => S.pipe(steps)(firstStep(...args))


module.exports = {
  default: pipe,
  pipe
}