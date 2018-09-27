const pipe = require('ramda/src/pipe')

const beforeOperator = f => {
  return component => {

    const Before = pipe(f, component)

    return Before
  }
}

module.exports = {
  default: beforeOperator,
  beforeOperator
}