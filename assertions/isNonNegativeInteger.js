import both from 'ramda/src/both'
import isNonNegative from './isNonNegative'
import isInteger from './isInteger'

const isNonPositiveInteger = both(isInteger, isNonNegative)

export default both(isInteger, isNonNegative)