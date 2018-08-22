import pipe from 'ramda/src/pipe'

export const afterOperator = f => {
  return component => {


    const After = sources => pipe(component, sinks => f(sinks, sources))(sources)

    return After
  }
}

export default afterOperator