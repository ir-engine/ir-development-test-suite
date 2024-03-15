import { MathUtils, Quaternion, Vector3 } from 'three'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import config from '@etherealengine/common/src/config'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { AvatarType } from '@etherealengine/common/src/schemas/user/avatar.schema'
import { UserID } from '@etherealengine/common/src/schemas/user/user.schema'
import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import { AvatarAnimationComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { loadAvatarModelAsset } from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkActions'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { PeerID, dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { Network, NetworkPeerFunctions, NetworkState } from '@etherealengine/network'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { V_010 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'

export const getAvatarLists = () => {
  const avatarState = getMutableState(AvatarState)
  const avatarList = avatarState.avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
  return avatarList
}

export const mockNetworkAvatars = (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const userId = ('user' + i) as UserID & PeerID
    const index = (1000 + i) as NetworkId
    const column = i * 2
    NetworkPeerFunctions.createPeer(NetworkState.worldNetwork as Network, userId, index, userId, index)
    dispatchAction(
      AvatarNetworkAction.spawn({
        position: new Vector3(0, 0, column),
        rotation: new Quaternion().setFromAxisAngle(V_010, Math.PI),
        ownerID: userId,
        entityUUID: (userId + '_avatar') as EntityUUID,
        avatarID: avatar.id
      })
    )
  }
}

export const loadNetworkAvatar = (avatar: AvatarType, i: number, u = 'user', x = 0) => {
  const userId = (u + i) as UserID & PeerID
  const index = (1000 + i) as NetworkId
  NetworkPeerFunctions.createPeer(NetworkState.worldNetwork as Network, userId, index, userId, index)
  dispatchAction(
    AvatarNetworkAction.spawn({
      position: new Vector3(x, 0, i * 2),
      rotation: new Quaternion().setFromAxisAngle(V_010, Math.PI),
      ownerID: userId,
      entityUUID: (userId + '_avatar') as EntityUUID,
      avatarID: avatar.id
    })
  )
  return userId
}

export const mockLoopAnimAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithLoopAnimation(avatar.modelResource?.url || '', new Vector3(4, 0, column), i)
  }
}

export const CreateSkinnedMeshGrid = (avatarList: AvatarType[], size: number) => {
  const square = Math.ceil(Math.sqrt(size))
  for (let i = 0; i < size; i++) {
    const x = i % square
    const y = Math.floor(i / square)
    const avatarIndex = i % avatarList.length
    loadAssetWithLoopAnimation(avatarList[avatarIndex].modelResource?.url ?? '', new Vector3(x * 2, 0, y * 2), i)
  }
}

export const mockTPoseAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetTPose(avatar.modelResource?.url || '', new Vector3(8, 0, column), i)
  }
}

export const mockIKAvatars = async (avatarList: AvatarType[], avatarAmount = null as null | number) => {
  for (let i = 0; i < (avatarAmount ?? avatarList.length); i++) {
    const avatar = avatarList[avatarAmount ? i % avatarList.length : i]
    const column = i * 2
    loadAssetWithIK(avatar, new Vector3(12, 0, column), i)
  }
}

export const loadAssetWithIK = (avatar: AvatarType, position: Vector3, i: number) => {
  const userId = loadNetworkAvatar(avatar, i, 'user_ik', position.x)
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      name: 'head',
      entityUUID: (userId + ikTargets.head) as EntityUUID,
      blendWeight: 0,
      position
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      name: 'leftHand',
      entityUUID: (userId + ikTargets.leftHand) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      name: 'rightHand',
      entityUUID: (userId + ikTargets.rightHand) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      name: 'leftFoot',
      entityUUID: (userId + ikTargets.leftFoot) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
  dispatchAction({
    ...AvatarNetworkAction.spawnIKTarget({
      name: 'rightFoot',
      entityUUID: (userId + ikTargets.rightFoot) as EntityUUID,
      blendWeight: 0
    }),
    ownerID: userId
  })
}

export const loadAssetTPose = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'TPose Avatar ' + i)
  setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
  setComponent(entity, TransformComponent, {
    position,
    rotation: new Quaternion().setFromAxisAngle(V_010, Math.PI)
  })
  loadAvatarModelAsset(entity, filename)
  setComponent(entity, AvatarAnimationComponent, {
    rootYRatio: 1,
    locomotion: new Vector3()
  })
  setComponent(entity, VisibleComponent, true)
  return entity
}

export const loadAssetWithLoopAnimation = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'Anim Avatar ' + i + ' ' + filename.split('/').pop())
  setComponent(entity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
  setComponent(entity, TransformComponent, {
    position,
    rotation: new Quaternion().setFromAxisAngle(V_010, Math.PI)
  })
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, LoopAnimationComponent, {
    activeClipIndex: 0,
    animationPack: config.client.fileServer + '/projects/default-project/assets/animations/emotes.glb'
  })
  setComponent(entity, ModelComponent, { src: filename, convertToVRM: true, cameraOcclusion: false })
  return entity
}
