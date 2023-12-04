module.exports = {
  'fail-zero': false,
  parallel: false,
  require: [
    'tests/mocha.env'
  ],
  extension: [
    'ts'
  ],
  bail: true,
  exit: true,
  recursive: true,
  jobs: '1',
  timeout: '60000'
};
