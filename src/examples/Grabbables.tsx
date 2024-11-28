import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { useLoadedSceneEntity } from '@ir-engine/client-core/src/hooks/useLoadedSceneEntity'
import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { EntityUUID, UUIDComponent, getComponent, setComponent } from '@ir-engine/ecs'
import { GrabbableComponent } from '@ir-engine/engine/src/grabbable/GrabbableComponent'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { HyperFlux, dispatchAction, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkTopics } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'
import { grabbableInteractMessage } from '@ir-engine/ui/src/components/editor/properties/grab'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import { useSpawnAvatar } from './utils/template'

const projectName = 'ir-engine/default-project'
const sceneName = 'public/scenes/default.gltf'

const grabbableEntityUUID = 'example grabbable' as EntityUUID

export default function GrabbablesEntry() {
  useSpawnAvatar(true)
  useLoadScene({ projectName, sceneName })
  useNetwork({ online: false })

  const locationSceneID = useHookstate(getMutableState(LocationState).currentLocation.location.sceneId).value
  const sceneEntity = useLoadedSceneEntity(locationSceneID)

  useEffect(() => {
    if (!sceneEntity) return

    dispatchAction(
      SpawnObjectActions.spawnObject({
        parentUUID: getComponent(sceneEntity, UUIDComponent),
        ownerID: HyperFlux.store.userID,
        $topic: NetworkTopics.world,
        entityUUID: grabbableEntityUUID
      })
    )
  }, [sceneEntity])

  const grabbableEntity = UUIDComponent.getEntityByUUID(grabbableEntityUUID)
  useEffect(() => {
    if (!grabbableEntity) return

    setComponent(grabbableEntity, VisibleComponent)
    setComponent(grabbableEntity, ShadowComponent)
    setComponent(grabbableEntity, TransformComponent, { scale: new Vector3(0.1, 0.1, 0.1) })
    setComponent(grabbableEntity, NameComponent, 'Grabbable')
    setComponent(grabbableEntity, PrimitiveGeometryComponent)
    setComponent(grabbableEntity, RigidBodyComponent, { type: 'dynamic' })
    setComponent(grabbableEntity, ColliderComponent, { shape: 'box' })
    setComponent(grabbableEntity, GrabbableComponent)
    setComponent(grabbableEntity, InputComponent)
    setComponent(grabbableEntity, InteractableComponent, {
      label: grabbableInteractMessage,
      callbacks: [
        {
          callbackID: GrabbableComponent.grabbableCallbackName,
          target: getComponent(grabbableEntity, UUIDComponent)
        }
      ]
    })
  }, [grabbableEntity])

  return null
}
