import React, { useEffect } from 'react'
import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three'

import { XRLightProbeState } from '@etherealengine/spatial/src/xr/XRLightProbeSystem'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { useLocationSpawnAvatar } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { getComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { Template } from './utils/template'

export const LightProbe = () => {
  const xrLightProbeState = useHookstate(getMutableState(XRLightProbeState))

  useEffect(() => {
    if (!xrLightProbeState.value) return

    const entity = createEntity()

    const ballGeometry = new SphereGeometry(0.5, 32, 32)
    const ballMaterial = new MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0,
      metalness: 1
    })
    const ballMesh = new Mesh(ballGeometry, ballMaterial)

    addObjectToGroup(entity, ballMesh)
    getComponent(entity, TransformComponent).position.set(0, 2, 0)
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'Light Estimation Helper')
    return () => {
      removeEntity(entity)
    }
  }, [xrLightProbeState])

  return null
}

export default function XRLightEstimation() {
  useLocationSpawnAvatar()
  return (
    <>
      <Template />
      <LightProbe />
    </>
  )
}
