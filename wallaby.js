module.exports = function () {
  return {
    files: [
      '**/*.js',
      '!**/*.spec.js',
      '!node_modules/**/*',
      '!old/**/*',
    ],

    tests: [
      // 'component.spec.js',
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
