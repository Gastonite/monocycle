import both from 'ramda/src/both'
import isNonPositive from './isNonPositive'
import isInteger from './isInteger'

const isNonPositiveInteger = both(isInteger, isNonPositive)

export default both(isInteger, isNonPositive)