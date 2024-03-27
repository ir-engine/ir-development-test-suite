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
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { getState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Group, MathUtils } from 'three'
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

export const ParticlesBenchmark: IBenchmark = {
  start: async () => {
    return new Promise((resolve) => {
      const entities = [] as Entity[]
      let createdObjects = 0

      const sceneID = getSceneID()
      const rootEntity = SceneState.getRootEntity(sceneID)

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
          setComponent(entity, TransformComponent, { position })
          setComponent(entity, ParticleSystemComponent)
          setComponent(entity, VisibleComponent, true)
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
