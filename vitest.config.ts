import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./tests/**/*.test.ts', './tests/**/*.test.tsx'],
    environment: 'jsdom',
    passWithNoTests: true,
    testTimeout: 60 * 1000
  }
})
