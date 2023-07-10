import path from 'path'

import { createLocations } from '@etherealengine/projects/createLocations'
import { ProjectEventHooks } from '@etherealengine/projects/ProjectConfigInterface'
import { Application } from '@etherealengine/server-core/declarations'
import { installAvatarsFromProject } from '@etherealengine/server-core/src/user/avatar/avatar-helper'

import packageJson from './package.json'

const avatarsFolder = path.resolve(__dirname, 'avatars')

const config = {
  onInstall: async (app: Application) => {
    await createLocations(app, packageJson.name)
    await app.service('route-activate').create({ project: packageJson.name, route: '/examples', activate: true })
    return Promise.all([
      installAvatarsFromProject(app, avatarsFolder + '/mixamo'),
      installAvatarsFromProject(app, avatarsFolder + '/reallusion')
      // installAvatarsFromProject(app, avatarsFolder + '/vrm'),
    ])
  },
  onLoad: (app: Application) => {}
  // TODO: remove avatars
  // onUninstall: (app: Application) => {
  // }
} as ProjectEventHooks

export default config
