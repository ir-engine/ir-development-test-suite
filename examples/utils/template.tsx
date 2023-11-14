import React, { useEffect } from 'react'

import { useLoadEngineWithScene, useOfflineNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'

export function Template(props: { projectName?: string; sceneName?: string }) {
  useLoadScene({ projectName: props.projectName ?? 'default-project', sceneName: props.sceneName ?? 'default' })
  useOfflineNetwork()
  useLoadEngineWithScene({ spectate: true })

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  return <></>
}
