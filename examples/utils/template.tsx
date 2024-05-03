import React, { useEffect } from 'react'

import { ARPlacement } from '@etherealengine/client-core/src/components/ARPlacement'
import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { Shelves } from '@etherealengine/client-core/src/components/Shelves'
import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { XRLoading } from '@etherealengine/client-core/src/components/XRLoading'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'

import './avatar/simulateMovement'
import { setComponent, Engine } from '@etherealengine/ecs'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'

export function Template(props: { projectName?: string; sceneName?: string }) {
  useLoadScene({ projectName: props.projectName ?? 'default-project', sceneName: props.sceneName ?? 'default' })
  useNetwork({ online: false })
  useLoadEngineWithScene()

  useEffect(() => {
    AvatarService.fetchAvatarList()
    setComponent(Engine.instance.viewerEntity, CameraOrbitComponent)
    setComponent(Engine.instance.viewerEntity, InputComponent)
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
