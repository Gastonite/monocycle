import $ from "xstream"
import makeComponent from './component'
import beforeOperator from './operators/before'
import afterOperator from './operators/after'
import ConcatOperator from './operators/concat'
import listenerOperator from './operators/listener'
import isolationOperator from './operators/isolation'
import reducerOperator from './operators/reducer'

import { div } from "@cycle/dom"

export const concat = ConcatOperator({
  defaultCombiner: $.merge,
  combiners: {
    DOM: (sink, otherSink) => $.combine(sink, otherSink).map(div)
  }
})

export default makeComponent({
  operators: ({
    before: beforeOperator,
    after: afterOperator,
    isolate: isolationOperator,
    reducer: reducerOperator,
    listener: listenerOperator,
    concat
  })
})