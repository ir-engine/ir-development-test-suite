import React, { useEffect } from 'react'

import { ARPlacement } from '@etherealengine/client-core/src/components/ARPlacement'
import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { Shelves } from '@etherealengine/client-core/src/components/Shelves'
import { useLoadEngineWithScene, useOfflineNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { XRLoading } from '@etherealengine/client-core/src/components/XRLoading'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'

import './avatar/simulateMovement'

export function Template(props: { projectName?: string; sceneName?: string }) {
  useLoadScene({ projectName: props.projectName ?? 'default-project', sceneName: props.sceneName ?? 'default' })
  useOfflineNetwork()
  useLoadEngineWithScene({ spectate: true })

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  return (
    <>
      <div style={{ pointerEvents: 'all' }}>
        <Shelves />
        <ARPlacement />
        <XRLoading />
        <MediaIconsBox />
      </div>
    </>
  )
}
