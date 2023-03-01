import type { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: './projectEventHooks.ts',
  thumbnail: '/static/xrengine_thumbnail.jpg',
  routes: {
    '/examples': {
      component: () => import('./examplesRoute')
    }
  },
  services: undefined,
  databaseSeed: undefined
}

export default config
