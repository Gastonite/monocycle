import pipe from 'ramda/src/pipe'

const beforeOperator = f => {
  return component => pipe(f, component)
}

export default beforeOperator