import pipe from 'ramda/src/pipe'

export const beforeOperator = f => {
  return component => {

    const Before = pipe(f, component)

    return Before
  }
}

export default beforeOperator