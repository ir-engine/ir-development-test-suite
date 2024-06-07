import {
  Entity,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { GroundPlaneComponent } from '@etherealengine/engine/src/scene/components/GroundPlaneComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { DirectionalLightComponent, TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'

export const setupEntity = (parent: Entity): Entity => {
  const entity = createEntity()
  setComponent(entity, UUIDComponent, generateEntityUUID())
  setComponent(entity, TransformComponent)
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  const sceneID = getComponent(parent, SourceComponent)
  setComponent(entity, SourceComponent, sceneID)

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

export const useSceneSetup = (sceneEntity: Entity) => {
  const groundPlane = useExampleEntity(sceneEntity)
  const directionalLight = useExampleEntity(sceneEntity)

  useEffect(() => {
    setComponent(groundPlane, GroundPlaneComponent)
    setComponent(groundPlane, NameComponent, 'ground-plane')
    setVisibleComponent(groundPlane, true)

    setComponent(directionalLight, DirectionalLightComponent)
    setComponent(directionalLight, NameComponent, 'directional-light')
    setVisibleComponent(directionalLight, true)
  }, [])
}
