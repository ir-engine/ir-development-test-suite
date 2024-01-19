import { createLocations } from '@etherealengine/projects/createLocations'
import { ProjectEventHooks } from '@etherealengine/projects/ProjectConfigInterface'
import { Application } from '@etherealengine/server-core/declarations'

import { installAvatarsFromProject } from '@etherealengine/server-core/src/user/avatar/avatar-helper'
import path from 'path'
import packageJson from './package.json'

const avatarsFolder = path.resolve(__dirname, 'avatars')

const config = {
  onInstall: async (app: Application) => {
    await createLocations(app, packageJson.name)
    await app.service('route-activate').create({ project: packageJson.name, route: '/examples', activate: true })
    await installAvatarsFromProject(app, avatarsFolder)
  }
} as ProjectEventHooks

export default config
