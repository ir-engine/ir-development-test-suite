import { useNetwork } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@ir-engine/client-core/src/components/World/LoadLocationScene'
import { useLoadedSceneEntity } from '@ir-engine/client-core/src/hooks/useLoadedSceneEntity'
import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { EntityUUID, UUIDComponent, getComponent, removeEntity, setComponent } from '@ir-engine/ecs'
import { InteractableComponent } from '@ir-engine/engine/src/interaction/components/InteractableComponent'
import { MountPointComponent } from '@ir-engine/engine/src/scene/components/MountPointComponent'
import { PrimitiveGeometryComponent } from '@ir-engine/engine/src/scene/components/PrimitiveGeometryComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { dispatchAction, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkTopics, ScenePeer, SceneUser } from '@ir-engine/network'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { SpawnObjectActions } from '@ir-engine/spatial/src/transform/SpawnObjectActions'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import { useSpawnAvatar } from './utils/template'

const projectName = 'ir-engine/default-project'
const sceneName = 'public/scenes/default.gltf'

const mountPointEntityUUID = 'example mount point' as EntityUUID
const seatEntityUUID = 'example seat' as EntityUUID

export default function MountPointsEntry() {
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
        ownerID: SceneUser,
        $peer: ScenePeer,
        $topic: NetworkTopics.world,
        entityUUID: seatEntityUUID
      })
    )
    dispatchAction(
      SpawnObjectActions.spawnObject({
        parentUUID: seatEntityUUID,
        position: new Vector3(0, 0.4, 0.2), // hardcoded to avatar proportions
        ownerID: SceneUser,
        $peer: ScenePeer,
        $topic: NetworkTopics.world,
        entityUUID: mountPointEntityUUID
      })
    )
  }, [sceneEntity])

  const mountPointEntity = UUIDComponent.getEntityByUUID(mountPointEntityUUID)
  const seatEntity = UUIDComponent.getEntityByUUID(seatEntityUUID)

  useEffect(() => {
    if (!mountPointEntity || !seatEntity) return

    setComponent(seatEntity, VisibleComponent)
    setComponent(seatEntity, ShadowComponent)
    setComponent(seatEntity, NameComponent, 'Seat')
    setComponent(seatEntity, PrimitiveGeometryComponent)
    setComponent(seatEntity, RigidBodyComponent, { type: 'fixed' })
    setComponent(seatEntity, ColliderComponent, { shape: 'box' })

    setComponent(mountPointEntity, VisibleComponent)
    setComponent(mountPointEntity, ShadowComponent)
    setComponent(mountPointEntity, NameComponent, 'Mount Point')
    setComponent(mountPointEntity, MountPointComponent, { dismountOffset: new Vector3(0, 0, 1) })
    setComponent(mountPointEntity, InputComponent)
    setComponent(mountPointEntity, InteractableComponent, {
      label: 'Sit',
      callbacks: [
        {
          callbackID: MountPointComponent.mountCallbackName,
          target: getComponent(mountPointEntity, UUIDComponent)
        }
      ]
    })

    return () => {
      removeEntity(mountPointEntity)
      removeEntity(seatEntity)
    }
  }, [mountPointEntity, seatEntity])

  return null
}
