import isPlainObject from 'lodash/isPlainObject'

export default x => isPlainObject(x)
  ? x
  : false