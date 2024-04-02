import config from '@etherealengine/common/src/config'
import { UserID, avatarPath } from '@etherealengine/common/src/schema.type.module'
import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import { AnimationComponent } from '@etherealengine/engine/src/avatar/components/AnimationComponent'
import {
  AvatarAnimationComponent,
  AvatarRigComponent
} from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { AvatarColliderComponent } from '@etherealengine/engine/src/avatar/components/AvatarControllerComponent'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { AvatarIKTargetState } from '@etherealengine/engine/src/avatar/state/AvatarIKTargetState'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { getMutableState } from '@etherealengine/hyperflux'
import { NetworkObjectComponent } from '@etherealengine/network'
import { TransformComponent } from '@etherealengine/spatial'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { Object3DComponent } from '@etherealengine/spatial/src/renderer/components/Object3DComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { Group, MathUtils, Vector3 } from 'three'
import { getSceneID, sleep, waitForPropertyLoad } from './BenchmarkUtils'

const avatarsToCreate = 10
const teardownWaitTime = 500
const benchmarkWaitTime = 2000

const waitForModelLoad = async (entity: Entity) => {
  const modelComponent = getComponent(entity, ModelComponent)
  return waitForPropertyLoad(modelComponent, 'scene')
}

const waitForAnimationLoad = async (entity: Entity) => {
  const animationComponent = getOptionalComponent(entity, AnimationComponent)
  return waitForPropertyLoad(animationComponent, 'animations')
}

const runAvatarBenchmark = async (onComplete: () => void) => {
  const entities = [] as Entity[]
  const validAnimations = [0, 2, 3, 4, 5, 6, 7, 14, 22, 29]
  const avatars = await Engine.instance.api.service(avatarPath).find({})
  const sceneID = getSceneID()
  const rootEntity = SceneState.getRootEntity(sceneID)

  for (let i = avatarsToCreate; i > 0; i--) {
    const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
    position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
    position.setY(0)
    position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
    const avatarSrc = avatars.data[i % avatars.data.length].modelResource?.url
    const entity = createEntity()
    entities.push(entity)

    const obj3d = new Group()
    obj3d.entity = entity
    setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
    setComponent(entity, EntityTreeComponent, { parentEntity: rootEntity })
    setComponent(entity, Object3DComponent, obj3d)
    setComponent(entity, TransformComponent, { position })
    setComponent(entity, VisibleComponent, true)
    setComponent(entity, ModelComponent, { src: avatarSrc, convertToVRM: true })
    setComponent(entity, LoopAnimationComponent, {
      animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb'
    })
    await waitForModelLoad(entity)
    await waitForAnimationLoad(entity)

    const loopAnimationComponent = getMutableComponent(entity, LoopAnimationComponent)
    loopAnimationComponent.activeClipIndex.set(validAnimations[Math.floor(Math.random() * validAnimations.length)])
  }

  await sleep(benchmarkWaitTime)
  for (const entity of entities) {
    removeEntity(entity)
  }
  await sleep(teardownWaitTime)
  onComplete()
}

export const AvatarBenchmark = (props: { onComplete: () => void }): null => {
  useEffect(() => {
    runAvatarBenchmark(props.onComplete)
  }, [])

  return null
}

const createIkTargetsForAvatar = (userID: string) => {
  const headUUID = (userID + ikTargets.head) as EntityUUID
  const leftHandUUID = (userID + ikTargets.leftHand) as EntityUUID
  const rightHandUUID = (userID + ikTargets.rightHand) as EntityUUID
  const leftFootUUID = (userID + ikTargets.leftFoot) as EntityUUID
  const rightFootUUID = (userID + ikTargets.rightFoot) as EntityUUID

  const avatarIKTargetState = getMutableState(AvatarIKTargetState) //[action.entityUUID].merge({ name: action.name })

  avatarIKTargetState.merge({
    [headUUID]: { name: 'head' },
    [leftHandUUID]: { name: 'leftHand' },
    [rightHandUUID]: { name: 'rightHand' },
    [leftFootUUID]: { name: 'leftFoot' },
    [rightFootUUID]: { name: 'rightFoot' }
  })
}

const runAvatarIKBenchmark = async (onComplete: () => void) => {
  const entities = [] as Entity[]
  const avatars = await Engine.instance.api.service(avatarPath).find({})
  const sceneID = getSceneID()
  const rootEntity = SceneState.getRootEntity(sceneID)

  for (let i = 0; i < avatarsToCreate; i++) {
    const position = getComponent(Engine.instance.cameraEntity, TransformComponent).position.clone()
    position.setX(position.x + MathUtils.randFloat(-2.0, 2.0))
    position.setY(0)
    position.setZ(position.z - 3.0 * i - avatarsToCreate / 3)
    const avatarSrc = avatars.data[i % avatars.data.length].modelResource?.url
    const entity = createEntity()
    entities.push(entity)

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
    setComponent(entity, ModelComponent, { src: avatarSrc, convertToVRM: true })
    setComponent(entity, AvatarColliderComponent)
    setComponent(entity, AvatarComponent)
    setComponent(entity, AvatarAnimationComponent, {
      rootYRatio: 1,
      locomotion: new Vector3()
    })
    setComponent(entity, AvatarRigComponent)
    createIkTargetsForAvatar(uuid)
    await waitForModelLoad(entity)
  }

  await sleep(benchmarkWaitTime)
  for (const entity of entities) {
    removeEntity(entity)
  }
  await sleep(teardownWaitTime)
  onComplete()
}

export const AvatarIKBenchmark = (props: { onComplete: () => void }): null => {
  useEffect(() => {
    runAvatarIKBenchmark(props.onComplete)
  }, [])

  return null
}
