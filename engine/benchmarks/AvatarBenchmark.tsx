import config from '@etherealengine/common/src/config'
import { AvatarID, UserID } from '@etherealengine/common/src/schema.type.module'
import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs'
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import {
  AvatarAnimationComponent,
  AvatarRigComponent
} from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { AvatarColliderComponent } from '@etherealengine/engine/src/avatar/components/AvatarControllerComponent'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkActions'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { applyIncomingActions, dispatchAction, useHookstate } from '@etherealengine/hyperflux'
import { NetworkObjectComponent } from '@etherealengine/network'
import { TransformComponent } from '@etherealengine/spatial'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import {
  EntityTreeComponent,
  removeEntityNodeRecursively
} from '@etherealengine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { Group, MathUtils, Quaternion, Vector3 } from 'three'
import { useAvatars } from '../TestUtils'
import { sleep } from './BenchmarkUtils'

const avatarsToCreate = 10
const benchmarkWaitTime = 3500
const validAnimations = [0, 2, 3, 4, 5, 6, 7, 14, 22, 29]

type AvatarSetupProps = {
  src: string
  position: Vector3
  animIndex: number
  rootEntity: Entity
}

export const AvatarBenchmark = (props: { rootEntity: Entity; onComplete: () => void }) => {
  const { rootEntity, onComplete } = props
  const completedCount = useHookstate(0)
  const avatars = useAvatars()
  const childProps = useHookstate<undefined | AvatarSetupProps[]>(undefined)

  useEffect(() => {
    const avatarArr = avatars.value
    if (!avatarArr.length || !rootEntity) return

    const props = [] as AvatarSetupProps[]
    for (let i = avatarsToCreate; i > 0; i--) {
      const position = getComponent(Engine.instance.viewerEntity, TransformComponent).position.clone()
      position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
      position.setY(0)
      position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
      const avatarSrc = avatarArr[i % avatarArr.length]
      props.push({
        src: avatarSrc,
        position: position,
        animIndex: validAnimations[Math.floor(Math.random() * validAnimations.length)],
        rootEntity: rootEntity
      })
    }
    childProps.set(props)
  }, [avatars, rootEntity])

  useEffect(() => {
    if (completedCount.value == avatarsToCreate) sleep(benchmarkWaitTime).then(onComplete)
  }, [completedCount.value == avatarsToCreate])

  return (
    <>
      {childProps.value &&
        childProps.value.map((props, index) => (
          <AvatarSetupReactor
            key={index}
            {...props}
            onComplete={() => {
              completedCount.set(completedCount.value + 1)
            }}
          />
        ))}
    </>
  )
}

const AvatarSetupReactor = (props: {
  src: string
  position: Vector3
  animIndex: number
  rootEntity: Entity
  onComplete: () => void
}) => {
  const { src, position, animIndex, rootEntity, onComplete } = props
  const entity = useHookstate(createEntity).value
  const model = useOptionalComponent(entity, ModelComponent)

  useEffect(() => {
    const obj3d = new Group()
    obj3d.entity = entity
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(entity, Object3DComponent, obj3d)
    setComponent(entity, TransformComponent, { position })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, ModelComponent, { src, convertToVRM: true })
    setComponent(entity, LoopAnimationComponent, {
      animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb',
      activeClipIndex: animIndex
    })

    return () => {
      removeEntityNodeRecursively(entity)
    }
  }, [])

  useEffect(() => {
    if (model?.scene.value) onComplete()
  }, [model?.scene])

  return null
}

const randomVec3 = (): Vector3 => {
  return new Vector3(MathUtils.randFloat(-2.0, 2.0), MathUtils.randFloat(2.0, 4.0), MathUtils.randFloat(-2, 2.0))
}

const randomQuaternion = (): Quaternion => {
  return new Quaternion().random()
}

const spawnAvatar = (
  rootUUID: EntityUUID,
  userID: string,
  avatarID: string,
  pose: {
    position: Vector3
    rotation: Quaternion
  }
) => {
  const entityUUID = (userID + '_avatar') as EntityUUID
  dispatchAction(
    AvatarNetworkAction.spawn({
      parentUUID: rootUUID,
      position: pose.position,
      rotation: pose.rotation,
      entityUUID: entityUUID,
      avatarID: avatarID as AvatarID,
      name: ''
    })
  )
}

const createIkTargetsForAvatar = (parentUUID: EntityUUID, userID: string): EntityUUID[] => {
  const headUUID = (userID + ikTargets.head) as EntityUUID
  const leftHandUUID = (userID + ikTargets.leftHand) as EntityUUID
  const rightHandUUID = (userID + ikTargets.rightHand) as EntityUUID
  const leftFootUUID = (userID + ikTargets.leftFoot) as EntityUUID
  const rightFootUUID = (userID + ikTargets.rightFoot) as EntityUUID

  const targetUUIDs = [headUUID, leftHandUUID, rightHandUUID, leftFootUUID, rightFootUUID]

  const posRot = targetUUIDs.map(() => ({ position: randomVec3(), rotation: randomQuaternion() }))

  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: headUUID, name: 'head', blendWeight: 1, ...posRot[0] })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: leftHandUUID,
      name: 'leftHand',
      blendWeight: 1,
      ...posRot[1]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: rightHandUUID,
      name: 'rightHand',
      blendWeight: 1,
      ...posRot[2]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: leftFootUUID,
      name: 'leftFoot',
      blendWeight: 1,
      ...posRot[3]
    })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({
      parentUUID,
      entityUUID: rightFootUUID,
      name: 'rightFoot',
      blendWeight: 1,
      ...posRot[4]
    })
  )

  applyIncomingActions()

  return targetUUIDs
}

export const AvatarIKBenchmark = (props: { rootEntity: Entity; onComplete: () => void }) => {
  const { rootEntity, onComplete } = props
  const childProps = useHookstate<undefined | AvatarSetupProps[]>(undefined)
  const completedCount = useHookstate(0)
  const avatars = useAvatars()

  useEffect(() => {
    const avatarArr = avatars.value
    if (!avatarArr.length || !rootEntity) return

    const props = [] as AvatarSetupProps[]
    for (let i = 0; i < avatarsToCreate; i++) {
      const position = getComponent(Engine.instance.viewerEntity, TransformComponent).position.clone()
      position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
      position.setY(0)
      position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
      const avatarSrc = avatarArr[i % avatarArr.length]
      props.push({
        src: avatarSrc,
        position: position,
        animIndex: 0,
        rootEntity: rootEntity
      })
    }
    childProps.set(props)
  }, [rootEntity, avatars])

  useEffect(() => {
    if (completedCount.value == avatarsToCreate) sleep(benchmarkWaitTime).then(onComplete)
  }, [completedCount.value == avatarsToCreate])

  return (
    <>
      {childProps.value &&
        childProps.value.map((props, index) => (
          <AvatarIKSetupReactor
            key={index}
            {...props}
            onComplete={() => {
              completedCount.set(completedCount.value + 1)
            }}
          />
        ))}
    </>
  )
}

const AvatarIKSetupReactor = (props: {
  src: string
  position: Vector3
  rootEntity: Entity
  onComplete: () => void
}) => {
  const { src, position, rootEntity, onComplete } = props
  const rootUUID = useComponent(rootEntity, UUIDComponent)
  const entity = useHookstate(createEntity).value
  const model = useOptionalComponent(entity, ModelComponent)

  useEffect(() => {
    const obj3d = new Group()
    obj3d.entity = entity
    const uuid = MathUtils.generateUUID()
    setComponent(entity, UUIDComponent, uuid as EntityUUID)
    setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(entity, Object3DComponent, obj3d)
    setComponent(entity, TransformComponent, { position })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, RigidBodyComponent, { type: 'kinematic' })
    setComponent(entity, NetworkObjectComponent, { ownerId: uuid as UserID })
    setComponent(entity, ModelComponent, { src: src, convertToVRM: true })
    setComponent(entity, AvatarColliderComponent)
    setComponent(entity, AvatarComponent)
    setComponent(entity, AvatarAnimationComponent, {
      rootYRatio: 1,
      locomotion: new Vector3()
    })
    setComponent(entity, AvatarRigComponent)

    spawnAvatar(rootUUID.value, uuid, src, { position, rotation: new Quaternion() })
    const targetUUIDs = createIkTargetsForAvatar(rootUUID.value, uuid)

    return () => {
      for (const targetUUID of targetUUIDs) {
        const targetEntity = UUIDComponent.getEntityByUUID(targetUUID)
        removeEntityNodeRecursively(targetEntity)
      }
      removeEntityNodeRecursively(entity)
    }
  }, [])

  useEffect(() => {
    if (model?.scene.value) onComplete()
  }, [model?.scene])

  return null
}
