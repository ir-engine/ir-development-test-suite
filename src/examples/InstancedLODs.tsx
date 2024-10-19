import { setComponent } from '@ir-engine/ecs'
import { DomainConfigState } from '@ir-engine/engine/src/assets/state/DomainConfigState'
import { InstancingComponent } from '@ir-engine/engine/src/scene/components/InstancingComponent'
import { Heuristic, VariantComponent } from '@ir-engine/engine/src/scene/components/VariantComponent'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3_Left, Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect } from 'react'
import { InstancedBufferAttribute, Matrix4, Quaternion } from 'three'
import { useRouteScene } from '../sceneRoute'
import { useExampleEntity } from './utils/common/entityUtils'

const SceneReactor = ({ sceneEntity }) => {
  const entity = useExampleEntity(sceneEntity!)

  useEffect(() => {
    setComponent(entity, TransformComponent)
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'Grass via Instance LODs')

    // create random instance matrix
    const matrices = [] as number[]
    const mat4 = new Matrix4()

    for (let i = 0; i < 1000; i++) {
      const rot = new Quaternion()
        .setFromAxisAngle(Vector3_Up, Math.random() * 2 * Math.PI)
        .multiply(new Quaternion().setFromAxisAngle(Vector3_Left, Math.PI * 0.5)) //rotate x by 90 degrees because the grass is facing the wrong way
      mat4.makeRotationFromQuaternion(rot)
      mat4.elements[12] = Math.random() * 10 - 5
      mat4.elements[13] = 0
      mat4.elements[14] = Math.random() * 10 - 5
      matrices.push(...mat4.elements)
    }

    const instanceMatrix = new InstancedBufferAttribute(new Float32Array(matrices), 16)

    setComponent(entity, InstancingComponent, { instanceMatrix })
    setComponent(entity, VariantComponent, {
      heuristic: Heuristic.DISTANCE,
      levels: [
        {
          src:
            getState(DomainConfigState).cloudDomain +
            '/projects/ir-engine/ir-development-test-suite/assets/LOD/grass/TundraGrass_LOD0_Var1.gltf',
          metadata: {
            minDistance: 0,
            maxDistance: 15
          }
        },
        {
          src:
            getState(DomainConfigState).cloudDomain +
            '/projects/ir-engine/ir-development-test-suite/assets/LOD/grass/TundraGrass_LOD1_Var1.gltf',
          metadata: {
            minDistance: 15,
            maxDistance: 25
          }
        },
        {
          src:
            getState(DomainConfigState).cloudDomain +
            '/projects/ir-engine/ir-development-test-suite/assets/LOD/grass/TundraGrass_LOD2_Var1.gltf',
          metadata: {
            minDistance: 25,
            maxDistance: 50
          }
        }
      ]
    })
  }, [])

  return null
}

export default function InstancedLODs() {
  const sceneEntity = useRouteScene()
  if (!sceneEntity) return null

  return <SceneReactor sceneEntity={sceneEntity} />
}
