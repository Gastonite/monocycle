

const pipe = require('ramda/src/pipe')
const unless = require('ramda/src/unless')
const concat = require('ramda/src/concat')
const when = require('ramda/src/when')
const objOf = require('ramda/src/objOf')
const over = require('ramda/src/over')
const lensProp = require('ramda/src/lensProp')
const always = require('ramda/src/always')
const isString = require('ramda-adjunct/lib/isString').default


const Log = (options = {}) => {

  const {
    log: _log = console.log.bind(console),
    scope = ''
  } = Log.coerce(options)

  if (!scope || !isString(scope))
    return _log

  const log = (...args) => {
    let prefix = scope

    const isColored = isString(args[0]) && args[0].startsWith('%c')

    if (isColored) {
      prefix = '%c' + prefix + ' ' + args[0].slice(2)
      args.shift()
    }

    _log(
      prefix,
      ...args
    )
    return args[1]
  }

  log.partial = (...args) => {

    return x => {

      return log(...args, x)
    }
  }

  log.Log = pipe(
    log.partial('Log1'),
    Log.coerce,
    log.partial('Log2'),
    over(lensProp('scope'), concat(scope)),
    log.partial('Log3'),
    Log,

    // (options = {}) => Log({
    //   ...options,
    //   log,
    //   scope: scope + (options.scope)
    // })
  )

  return log
}

Log.coerce = pipe(
  when(isString, objOf('scope')),
  over(lensProp('scope'), unless(isString, always('')))
)

module.exports = {
  default: Log,
  Log
}