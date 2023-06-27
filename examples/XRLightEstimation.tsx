import React, { useEffect, useState } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { createPhysicsObjects } from './utils/common/loadPhysicsHelpers'
import { Template } from './utils/template'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { QueryReactor } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { XRPlaneComponent } from '@etherealengine/engine/src/xr/XRComponents'
import { Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshStandardMaterial, SphereGeometry } from 'three'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { removeComponent, setComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { XRLightProbeState } from '@etherealengine/engine/src/xr/XRLightProbeSystem'

const LightProbe = () => {
  const xrLightProbeState = useHookstate(getMutableState(XRLightProbeState).environment)

  useEffect(() => {
    if (!xrLightProbeState.value) return

    // const entity = createEntity()

    const ballGeometry = new SphereGeometry(0.5, 32, 32)
    const ballMaterial = new MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0,
      metalness: 1
    })
    const ballMesh = new Mesh(ballGeometry, ballMaterial)

    Engine.instance.scene.add(ballMesh)
    // ballGroup.add(ballMesh);

    // const outlineMesh = new Mesh(isEstimatingLight.geometry.value, new MeshBasicMaterial({ wireframe: true }))
    // addObjectToGroup(entity, outlineMesh)
    // setComponent(entity, VisibleComponent)
    // setComponent(entity, NameComponent, 'Plane ' + isEstimatingLight.plane.orientation.value)
    return () => {
      // removeObjectFromGroup(entity, outlineMesh)
      // removeComponent(entity, VisibleComponent)
    }
  }, [xrLightProbeState])

  return null
}

export default function AvatarBenchmarking() {
  return (
    <>
      <Template />
      <div style={{ pointerEvents: 'all' }}>
        <MediaIconsBox />
      </div>
      <LightProbe />
    </>
  )
}
