module.exports = {
  'fail-zero': false,
  parallel: false,
  require: [
    'tests/mocha.env', // init env here
    'ts-node/register',
    'jsdom-global/register'
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
