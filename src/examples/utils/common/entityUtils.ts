import {
  Entity,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'

export const setupEntity = (parent: Entity): Entity => {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, generateEntityUUID())
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  // const sceneID = getComponent(parent, SourceComponent)
  // setComponent(entity, SourceComponent, sceneID)

  return entity
}

export const useExampleEntity = (parent: Entity): Entity => {
  const exampleEntity = useHookstate(() => setupEntity(parent))

  useEffect(() => {
    return () => {
      removeEntity(exampleEntity.value)
    }
  }, [])

  return exampleEntity.value
}
