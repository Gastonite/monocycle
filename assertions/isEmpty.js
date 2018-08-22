import prop from 'ramda/src/prop'
import isNonPositiveInteger from './isNonPositiveInteger'

const isEmpty = x => isNonPositiveInteger(prop('length', x))

export default isEmpty