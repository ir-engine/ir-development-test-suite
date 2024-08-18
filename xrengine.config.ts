import type { ProjectConfigInterface } from '@ir-engine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/ir-engine_thumbnail.jpg',
  routes: {
    '/examples': {
      component: () => import('./src/examplesRoute')
    },
    '/benchmarks': {
      component: () => import('./src/benchmarksRoute')
    },
    '/benchmarksAll': {
      component: () => import('./src/benchmarksAllRoute')
    }
  },
  services: undefined,
  databaseSeed: undefined,
  worldInjection: () => import('./worldInjection')
}

export default config
