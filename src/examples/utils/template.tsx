import React, { useEffect } from 'react'

import { ARPlacement } from '@etherealengine/client-core/src/components/ARPlacement'
import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { Shelves } from '@etherealengine/client-core/src/components/Shelves'
import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { XRLoading } from '@etherealengine/client-core/src/components/XRLoading'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'

import './avatar/simulateMovement'

export function useSpawnAvatar(spawnAvatar?: boolean) {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (spawnAvatar) {
      url.searchParams.delete('spectate')
    } else {
      url.searchParams.set('spectate', '')
    }
    window.history.pushState({}, '', url.toString())
  }, [spawnAvatar])
}

export function Template(props: { projectName?: string; sceneName?: string; spawnAvatar?: boolean }) {
  useSpawnAvatar(props.spawnAvatar)
  useLoadScene({
    projectName: props.projectName ?? 'default-project',
    sceneName: props.sceneName ?? 'public/scenes/default.gltf'
  })
  useNetwork({ online: false })
  useLoadEngineWithScene()

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
