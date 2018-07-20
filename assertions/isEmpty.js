import get from 'lodash/get'
import isUndefined from './isUndefined'
import isNonPositiveInteger from './isNonPositiveInteger'

const isEmpty = x => isNonPositiveInteger(get(x, 'length'))

export default isEmpty