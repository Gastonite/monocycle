import { isFunction } from 'util'

export default x => typeof x === 'function'
  ? x
  : false