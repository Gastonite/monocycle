const toUpper = require('ramda/src/toUpper')
const replace = require('ramda/src/replace')

const capitalize = replace(/^./, toUpper)

module.exports = capitalize