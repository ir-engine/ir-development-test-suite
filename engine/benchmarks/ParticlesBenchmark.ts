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
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { TransformComponent } from '@etherealengine/spatial'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { Group, MathUtils } from 'three'

const objectsToCreate = 30
const waitTimeBetween = 200
const simulateTime = 3000

const createParticleEntity = (rootEntity: Entity) => {
  const entity = createEntity()

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

  return entity
}

export const ParticlesBenchmark = (props: { rootEntity: Entity; onComplete: () => void }): null => {
  const { rootEntity, onComplete } = props

  useEffect(() => {
    if (!rootEntity) return

    const entities = [] as Entity[]
    let createdObjects = 0

    const spawnObject = () => {
      createdObjects += 1
      if (createdObjects <= objectsToCreate) {
        const entity = createParticleEntity(rootEntity)
        entities.push(entity)
        setTimeout(spawnObject, waitTimeBetween)
      } else {
        setTimeout(() => {
          onComplete()
        }, simulateTime)
      }
    }

    spawnObject()

    return () => {
      for (const entity of entities) {
        removeEntity(entity)
      }
    }
  }, [rootEntity])

  return null
}
