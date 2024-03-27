import { SceneID } from '@etherealengine/common/src/schema.type.module'
import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { PrimitiveGeometryComponent } from '@etherealengine/engine/src/scene/components/PrimitiveGeometryComponent'
import { GeometryTypeEnum } from '@etherealengine/engine/src/scene/constants/GeometryTypeEnum'
import { getState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Group, MathUtils, Vector3 } from 'three'
import { IBenchmark } from './BenchmarkOrchestration'

const objectsToCreate = 30
const waitTimeBetween = 200
const simulateTime = 3000

const getSceneID = (): SceneID => {
  const scenes = getState(SceneState).scenes
  for (const key in scenes) {
    const scene = scenes[key]
    if (scene.name) return key as SceneID
  }

  return '' as SceneID
}

export const PhysicsBenchmark: IBenchmark = {
  start: async () => {
    return new Promise((resolve) => {
      const entities = [] as Entity[]
      let createdObjects = 0

      const sceneID = getSceneID()
      const rootEntity = SceneState.getRootEntity(sceneID)
      const scale = new Vector3(0.5, 0.5, 0.5)

      const spawnObject = () => {
        createdObjects += 1
        if (createdObjects <= objectsToCreate) {
          const entity = createEntity()
          entities.push(entity)

          const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
          position.setZ(position.z - 7.0)
          position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
          const obj3d = new Group()
          obj3d.entity = entity
          setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
          setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
          setComponent(entity, Object3DComponent, obj3d)
          setComponent(entity, TransformComponent, { position, scale })
          setComponent(entity, PrimitiveGeometryComponent, {
            geometryType: GeometryTypeEnum.SphereGeometry,
            geometryParams: {
              radius: 1,
              widthSegments: 32,
              heightSegments: 16,
              phiStart: 0,
              phiLength: 6.283185307179586,
              thetaStart: 0,
              thetaLength: 3.141592653589793
            }
          })
          setComponent(entity, VisibleComponent, true)
          setComponent(entity, RigidBodyComponent, { type: 'dynamic' })
          setComponent(entity, ColliderComponent, {
            shape: 'sphere',
            mass: MathUtils.randFloat(0.5, 1.5),
            friction: MathUtils.randFloat(0.1, 1.0),
            restitution: MathUtils.randFloat(0.1, 1.0)
          })

          setTimeout(spawnObject, waitTimeBetween)
        } else {
          setTimeout(() => {
            for (const entity of entities) {
              removeEntity(entity)
            }
            resolve()
          }, simulateTime)
        }
      }

      spawnObject()
    })
  }
}
