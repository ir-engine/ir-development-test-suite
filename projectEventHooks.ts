import { ProjectEventHooks } from '@etherealengine/projects/ProjectConfigInterface'
import { Application } from '@etherealengine/server-core/declarations'

import { installAvatarsFromProject } from '@etherealengine/server-core/src/user/avatar/avatar-helper'
import path from 'path'
import packageJson from './manifest.json'
import appRootPath from 'app-root-path'

const avatarsFolder = path.join(appRootPath.path, 'packages/projects/projects', packageJson.name, 'public/avatars')

const config = {
  onInstall: async (app: Application) => {
    await app.service('route-activate').create({ project: packageJson.name, route: '/examples', activate: true })
    await installAvatarsFromProject(app, avatarsFolder)
  }
} as ProjectEventHooks

export default config
