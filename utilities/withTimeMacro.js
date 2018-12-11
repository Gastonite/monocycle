const { withTime } = require('cyclejs-test-helpers')

const withTimeMacro = test => (t, ...others) => withTime(Time => test(t, Time, ...others))()

module.exports = {
  default: withTimeMacro,
  withTimeMacro
}