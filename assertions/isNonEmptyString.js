import both from 'ramda/src/both'
import isNotEmpty from './isNotEmpty'
import isString from './isString'

export default both(isString, isNotEmpty)