import { useLoadEngineWithScene, useNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { getComponent, setComponent } from '@etherealengine/ecs'
import { getMutableState, useHookstate, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { updateWorldOriginFromScenePlacement } from '@etherealengine/spatial/src/transform/updateWorldOrigin'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'
import { EmulatorDevtools } from 'ee-bot/devtool/EmulatorDevtools'
import 'ee-bot/src/functions/BotHookSystem'
import React, { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'
import { useRouteScene } from '../sceneRoute'
import { Transform } from './utils/transform'

export default function ScenePlacement() {
  const sceneEntity = useRouteScene('default-project', 'public/scenes/apartment.gltf')
  useNetwork({ online: false })
  useLoadEngineWithScene()
  const viewerEntity = useMutableState(EngineState).viewerEntity.value
  const localFloorEntity = useMutableState(EngineState).localFloorEntity.value

  useImmediateEffect(() => {
    if (!viewerEntity) return
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
    setComponent(viewerEntity, CameraOrbitComponent)
    setComponent(viewerEntity, InputComponent)
    getComponent(viewerEntity, CameraComponent).position.set(0, 3, 4)
  }, [viewerEntity])

  /** Origin Transform */
  const transformState = useHookstate({
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  useEffect(() => {
    if (!localFloorEntity) return
    const xrState = getMutableState(XRState)
    xrState.scenePosition.value.copy(transformState.position.value)
    xrState.sceneRotation.value.copy(transformState.rotation.value)
    xrState.sceneScale.set(transformState.scale.value.x)
    updateWorldOriginFromScenePlacement()
  }, [localFloorEntity, transformState.position, transformState.rotation, transformState.scale])

  /** Scene Transform */
  const transformState2 = useHookstate({
    position: new Vector3(), //(2, 0, 2),
    rotation: new Quaternion(),
    scale: new Vector3() //.setScalar(0.1)
  })

  useEffect(() => {
    if (!sceneEntity.value) return
    setComponent(sceneEntity.value, TransformComponent, {
      position: transformState2.position.value,
      rotation: transformState2.rotation.value,
      scale: transformState2.scale.value
    })
  }, [sceneEntity, transformState2.position, transformState2.rotation, transformState2.scale])

  return (
    <div className="flex-grid pointer-events-auto absolute right-0 flex h-full w-fit flex-col justify-start gap-1.5">
      <Transform title={'Origin'} transformState={transformState} />
      <Transform title={'Scene'} transformState={transformState2} />
      <EmulatorDevtools />
    </div>
  )
}

/**
 * Scene placement
 * -
 */
