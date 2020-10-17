import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: ['test/**/*.test.js'],
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
  ],
  coverage: true,
  dedupe: true,
};
