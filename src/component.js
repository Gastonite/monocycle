import isFunction from 'lodash.isfunction'

const makeComponent = ({
  methods = {}
} = {}) => {

  const Component = factory => {

    if (!isFunction(factory))
      factory = Component.empty

    if (factory.isComponent)
      return factory

    const map = f => Component(
      Object.assign(f(factory), methods)
    )

    return Object.assign(factory,
      (Object.keys(methods) || []).reduce((before, key) => {

        const method = methods[key]

        console.log('[monocycle]', {
          key,
          method
        })

        return !isFunction(method)
          ? before
          : Object.assign({}, before, {
            [key]: method(map)
          })

      }, {}), {
        isComponent: true,
        map,
      })
  }

  Component.empty = () => ({})

  return Component
}

export default makeComponent