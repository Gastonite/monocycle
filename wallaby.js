module.exports = function () {
  return {
    files: [
      '**/*.js',
      // 'components/Dynamic/*.js',
      // 'utilities/*.js',
      '!**/*.spec.js',
      '!node_modules/**/*',
      '!old/**/*',
    ],

    tests: [
      '**/*.spec.js',
    ],
    env: {
      type: 'node'
    },
    testFramework: 'ava',
    setup: wallaby => {

    },
    debug: true
  }
}
