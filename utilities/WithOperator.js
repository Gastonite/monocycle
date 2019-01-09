const isNonEmptyString = require('ramda-adjunct/lib/isNonEmptyString').default
const isFunction = require('ramda-adjunct/lib/isFunction').default
const { assign } = require('./assign')

const WithOperator = (name, makeBehavior) => {

  if (!isNonEmptyString(name))
    throw new Error(`WithOperatorError: 'name' must be a string`)

  if (!isFunction(makeBehavior))
    throw new Error(`WithOperatorError: 'makeBehavior' must be a functon`)

  return Component => assign({
    operators: {
      ...Component.operators,
      [name]: makeBehavior
    },
  })(Component)
}

module.exports = {
  default: WithOperator,
  WithOperator
}