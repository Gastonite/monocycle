import identity from 'ramda/src/identity'
import isolate from '@cycle/isolate'


const WithIsolation = scope => component => isolate(component, scope)

export default WithIsolation