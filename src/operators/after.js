import pipe from 'ramda/src/pipe'

const afterOperator = f => {
  return component => sources => pipe(component, sinks => f(sinks, sources))(sources)
}

export default afterOperator