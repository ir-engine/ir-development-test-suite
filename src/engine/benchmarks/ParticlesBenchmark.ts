import { Engine, Entity, getComponent, removeEntity, setComponent } from '@etherealengine/ecs'
import { ParticleSystemComponent } from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { TransformComponent } from '@etherealengine/spatial'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { Group, MathUtils } from 'three'
import { setupEntity } from '../../examples/utils/common/entityUtils'

const objectsToCreate = 30
const waitTimeBetween = 200
const simulateTime = 3000

const createParticleEntity = (rootEntity: Entity) => {
  const entity = setupEntity(rootEntity)

  const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
  position.setZ(position.z - 7.0)
  position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
  const obj3d = new Group()
  obj3d.entity = entity
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

    let running = true
    const entities = [] as Entity[]
    let createdObjects = 0

    const spawnObject = () => {
      if (!running) return
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
      running = false
      for (const entity of entities) {
        removeEntity(entity)
      }
    }
  }, [rootEntity])

  return null
}
