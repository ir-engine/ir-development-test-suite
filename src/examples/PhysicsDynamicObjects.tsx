import { MediaIconsBox } from '@ir-engine/client-core/src/components/MediaIconsBox'
import { useLoadEngineWithScene, useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { Entity, QueryReactor, removeEntity, useOptionalComponent } from '@ir-engine/ecs'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getMutableState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { EmulatorDevtools } from '@ir-engine/ir-bot/devtool/EmulatorDevtools'
import '@ir-engine/ir-bot/src/functions/BotHookSystem'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { XRDetectedMeshComponent } from '@ir-engine/spatial/src/xr/XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from '@ir-engine/spatial/src/xr/XRDetectedPlaneComponent'
import React, { useEffect } from 'react'
import { useRouteScene } from '../sceneRoute'
import { DetectedMeshes, DetectedPlanes } from './XRMeshes'
import { createPhysicsEntity } from './multipleScenes'

export default function PhysicsDynamicObjects() {
  const sceneEntity = useRouteScene('ir-engine/default-project', 'public/scenes/apartment.gltf')!
  useNetwork({ online: false })
  useLoadEngineWithScene()
  const viewerEntity = useMutableState(EngineState).viewerEntity.value

  useImmediateEffect(() => {
    if (!viewerEntity) return
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
  }, [viewerEntity])

  const gltfComponent = useOptionalComponent(sceneEntity, GLTFComponent)

  useEffect(() => {
    if (gltfComponent?.progress?.value !== 100) return
    const entities = [] as Entity[]
    for (let i = 0; i < 10; i++) {
      entities.push(createPhysicsEntity(sceneEntity))
    }
    return () => {
      for (const entity of entities) {
        removeEntity(entity)
      }
    }
  }, [gltfComponent?.progress?.value])

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
