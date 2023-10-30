import React, { useEffect } from 'react'
import { Mesh, MeshBasicMaterial, MeshNormalMaterial } from 'three'

import { MediaIconsBox } from '@etherealengine/client-core/src/components/MediaIconsBox'
import {
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { QueryReactor } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { XRPlaneComponent } from '@etherealengine/engine/src/xr/XRComponents'

import { Template } from './utils/template'
import { useLocationSpawnAvatar } from '@etherealengine/client-core/src/components/World/EngineHooks'

const DetectedPlanes = () => {
  const entity = useEntityContext()

  const xrPlane = useComponent(entity, XRPlaneComponent)

  useEffect(() => {
    if (!xrPlane.geometry.value) return
    const outlineMesh = new Mesh(xrPlane.geometry.value, new MeshBasicMaterial({ wireframe: true }))
    const transparentMesh = new Mesh(
      xrPlane.geometry.value,
      new MeshNormalMaterial({ opacity: 0.5, transparent: true })
    )
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

  useLocationSpawnAvatar()

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
