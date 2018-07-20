import toUpper from 'ramda/src/toUpper'
import replace from 'ramda/src/replace'

const capitalize = replace(/^./, toUpper)

export default capitalize