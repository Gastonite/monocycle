const Factory = behaviorFactory => {

  return options => behaviorFactory(options)()
}

module.exports = {
  default: Factory,
  Factory
}