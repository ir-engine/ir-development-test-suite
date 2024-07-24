import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { QueryReactor, createEntity, removeEntity, setComponent } from '@etherealengine/ecs'
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { getMutableState, getState, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { XRDetectedMeshComponent } from '@etherealengine/spatial/src/xr/XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from '@etherealengine/spatial/src/xr/XRDetectedPlaneComponent'
import { EmulatorDevtools } from 'ee-bot/devtool/EmulatorDevtools'
import 'ee-bot/src/functions/BotHookSystem'
import React from 'react'
import { useRouteScene } from '../sceneRoute'
import { DetectedMeshes, DetectedPlanes } from './XRMeshes'

export default function ImmersiveAR() {
  useRouteScene('default-project', 'public/scenes/apartment.gltf')
  useNetwork({ online: false })
  useLoadEngineWithScene()
  const viewerEntity = useMutableState(EngineState).viewerEntity.value

  useImmediateEffect(() => {
    if (!viewerEntity) return
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)

    /** Add ground plane to ensure the avatar never falls out of the world */
    const localFloorEntity = getState(EngineState).localFloorEntity
    const groundPlaneEntity = createEntity()
    setComponent(groundPlaneEntity, EntityTreeComponent, { parentEntity: localFloorEntity })
    setComponent(groundPlaneEntity, TransformComponent)
    setComponent(groundPlaneEntity, GroundPlaneComponent, { visible: false })

    return () => {
      removeEntity(groundPlaneEntity)
    }
  }, [viewerEntity])

  return (
    <>
      <QueryReactor Components={[XRDetectedPlaneComponent]} ChildEntityReactor={DetectedPlanes} />
      <QueryReactor Components={[XRDetectedMeshComponent]} ChildEntityReactor={DetectedMeshes} />
      <MediaIconsBox />
      <div className="flex-grid pointer-events-auto absolute right-0 flex h-full w-fit flex-col justify-start gap-1.5">
        <EmulatorDevtools mode="immersive-ar" />
      </div>
    </>
  )
}
