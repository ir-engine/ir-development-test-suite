import { createLocations } from '@etherealengine/projects/createLocations'
import { ProjectEventHooks } from '@etherealengine/projects/ProjectConfigInterface'
import { Application } from '@etherealengine/server-core/declarations'

import packageJson from './package.json'

const config = {
  onUpdate: async (app: Application) => {
    await createLocations(app, packageJson.name)
  },
  onInstall: async (app: Application) => {
    await app.service('route-activate').create({ project: packageJson.name, route: '/examples', activate: true })
  }
} as ProjectEventHooks

export default config
