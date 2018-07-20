import both from 'ramda/src/both'
import isNotEmpty from './isNotEmpty'
import isArray from './isArray'

export default both(isArray, isNotEmpty)