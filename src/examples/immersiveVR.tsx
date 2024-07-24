import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { QueryReactor } from '@etherealengine/ecs'
import { getMutableState, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { XRDetectedMeshComponent } from '@etherealengine/spatial/src/xr/XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from '@etherealengine/spatial/src/xr/XRDetectedPlaneComponent'
import { EmulatorDevtools } from 'ee-bot/devtool/EmulatorDevtools'
import 'ee-bot/src/functions/BotHookSystem'
import React from 'react'
import { useRouteScene } from '../sceneRoute'
import { DetectedMeshes, DetectedPlanes } from './XRMeshes'

export default function ImmersiveVR() {
  useRouteScene('default-project', 'public/scenes/default.gltf')
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
      <QueryReactor Components={[XRDetectedPlaneComponent]} ChildEntityReactor={DetectedPlanes} />
      <QueryReactor Components={[XRDetectedMeshComponent]} ChildEntityReactor={DetectedMeshes} />
      <MediaIconsBox />
      <div className="flex-grid pointer-events-auto absolute right-0 flex h-full w-fit flex-col justify-start gap-1.5">
        <EmulatorDevtools mode="immersive-vr" />
      </div>
    </>
  )
}
