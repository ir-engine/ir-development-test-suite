import React, { useEffect, useState } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { removeEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { createPhysicsObjects } from './utils/loadPhysicsHelpers'
import { Template } from './utils/template'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { QueryReactor } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { XRPlaneComponent } from '@etherealengine/engine/src/xr/XRComponents'
import { Mesh, MeshBasicMaterial, MeshNormalMaterial } from 'three'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { removeComponent, setComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'

const DetectedPlanes = () => {
  const entity = useEntityContext()

  const xrPlane = useComponent(entity, XRPlaneComponent)

  useEffect(() => {
    if (!xrPlane.geometry.value) return
    const outlineMesh = new Mesh(xrPlane.geometry.value, new MeshBasicMaterial({ wireframe: true }))
    const transparentMesh = new Mesh(xrPlane.geometry.value, new MeshNormalMaterial({ opacity: 0.5, transparent: true }))
    addObjectToGroup(entity, outlineMesh)
    addObjectToGroup(entity, transparentMesh)
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'Plane ' + xrPlane.plane.orientation.value)
    return () => {
      removeObjectFromGroup(entity, outlineMesh)
      removeObjectFromGroup(entity, transparentMesh)
      removeComponent(entity, VisibleComponent)
    }
  }, [xrPlane.geometry])

  return null
}

export default function AvatarBenchmarking() {
  return (
    <>
      <Template />
      <div style={{ pointerEvents: 'all' }}>
        <MediaIconsBox />
      </div>
      <QueryReactor Components={[XRPlaneComponent]} ChildEntityReactor={DetectedPlanes} />
    </>
  )
}
