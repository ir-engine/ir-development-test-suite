import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { setComponent } from '@etherealengine/ecs'
import { getMutableState, useHookstate, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { updateWorldOriginFromScenePlacement } from '@etherealengine/spatial/src/transform/updateWorldOrigin'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'
import { EmulatorDevtools } from 'ee-bot/devtool/EmulatorDevtools'
import 'ee-bot/src/functions/BotHookSystem'
import React, { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'
import { useRouteScene } from '../sceneRoute'
import { Transform } from './utils/transform'

export default function ImmersiveVR() {
  const sceneEntity = useRouteScene('default-project', 'public/scenes/default.gltf')
  useNetwork({ online: false })
  useLoadEngineWithScene()
  const viewerEntity = useMutableState(EngineState).viewerEntity.value

  useImmediateEffect(() => {
    if (!viewerEntity) return
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
  }, [viewerEntity])

  return (
    <>
      <MediaIconsBox />
      <div className="flex-grid pointer-events-auto absolute right-0 flex h-full w-fit flex-col justify-start gap-1.5">
        <EmulatorDevtools />
      </div>
    </>
  )
}
