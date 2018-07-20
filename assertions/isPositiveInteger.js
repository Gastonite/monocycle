import both from 'ramda/src/both'
import isPositive from './isPositive'
import isInteger from './isInteger'

const isNonPositiveInteger = both(isInteger, isPositive)

export default both(isInteger, isPositive)