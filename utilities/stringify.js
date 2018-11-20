const isRegExp = require('../assertions/isRegExp')
const isUndefined = require('../assertions/isUndefined')

const stringify = state => {

  try {

    return JSON.stringify(
      state,
      (k, v) => isUndefined(v)
        ? 'undefined'
        : (
          isRegExp(v)
            ? v.toString()
            : v
        ),
      2
    )

  } catch (err) {
    throw new Error(`StringifyError: ${err.message}`)
  }
}

module.exports = stringify