import React, { useEffect } from 'react'


import { Template } from './utils/template'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SplineComponent } from '@etherealengine/engine/src/scene/components/SplineComponent'
import { SplineTrackComponent } from '@etherealengine/engine/src/scene/components/SplineTrackComponent'
import { BoxGeometry, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, SphereGeometry, Vector3 } from 'three'
import { setTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

const createSpline = (index = 0) => {
  const entity = createEntity()

  setTransformComponent(entity)
  setComponent(entity, UUIDComponent, `Spline: ${index}` as EntityUUID)
  setComponent(entity, NameComponent, `Spline: ${index}`)
  setComponent(entity, VisibleComponent)

  setComponent(entity, SplineComponent, {
    elements: [
      {
        position: new Vector3(0, index * 5, 0),
        quaternion: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0)
      },
      {
        position: new Vector3(10, index * 5, 0),
        quaternion: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
      },
      {
        position: new Vector3(10, index * 5, 10),
        quaternion: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI)
      },
      {
        position: new Vector3(0, index * 5, 10),
        quaternion: new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI * 1.5)
      }
    ]
  })
}

export default function Splines() {

  useEffect(() => {
    const trackEntity = createEntity()
    setComponent(trackEntity, NameComponent, `Track`)
    setComponent(trackEntity, VisibleComponent)
    const mesh = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({ color: 0xff00ff }))
    const pointerMesh = new Mesh(new BoxGeometry(1, 1, 2), new MeshBasicMaterial({ color: 0x0000ff }))
    pointerMesh.translateZ(1)
    mesh.add(pointerMesh)
    addObjectToGroup(trackEntity, mesh)

    for (const i of [0, 1, 2, 3]) {
      createSpline(i)
    }

    setComponent(trackEntity, SplineTrackComponent, {
      splineEntityUUID: `Spline: 0` as EntityUUID,
      velocity: 5
    })

    setInterval(() => {
      const spline = Math.floor(Math.random() * 4)
      setComponent(trackEntity, SplineTrackComponent, {
        splineEntityUUID: `Spline: ${spline}` as EntityUUID
      })
    }, 5000)
  }, [])

  return (
    <>
      <Template />
    </>
  )
}
