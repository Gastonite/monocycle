const isUndefined = require('ramda-adjunct/lib/isUndefined').default
const isRegExp = require('ramda-adjunct/lib/isRegExp').default

const stringify = state => {

  try {

    return JSON.stringify(
      state,
      (k, v) => isUndefined(v)
        ? 'UNDEFINED'
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

module.exports = {
  default: stringify,
  stringify
}