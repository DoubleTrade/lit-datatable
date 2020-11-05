import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';

const sauceLabsLauncher = createSauceLabsLauncher({
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  region: 'us-west-1',
});

const sharedCapabilities = {
  'sauce:options': {
    name: 'lit-datatable',
    build: `lit-datatable ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
  },
};

export default {
  files: ['test/**/*.test.js'],
  nodeResolve: true,
  coverage: true,
  dedupe: true,
  browsers: [
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'firefox',
      browserVersion: 'latest',
      platformName: 'Windows 10',
    }),
    sauceLabsLauncher({
      ...sharedCapabilities,
      browserName: 'safari',
      browserVersion: 'latest',
      platformName: 'macOS 10.15',
    }),
  ],
};
