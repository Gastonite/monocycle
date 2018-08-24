const pipe = require('ramda/src/pipe')

const afterOperator = f => {
  return component => {


    const After = sources => pipe(component, sinks => f(sinks, sources))(sources)

    return After
  }
}

module.exports = {
  default: afterOperator,
  afterOperator
}