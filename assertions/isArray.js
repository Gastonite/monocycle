import isArray from 'lodash/isArray'

export default x => isArray(x)
  ? x
  : false