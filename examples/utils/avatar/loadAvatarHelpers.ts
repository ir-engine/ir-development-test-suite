import { Mesh, MeshNormalMaterial, Quaternion, Vector3 } from 'three'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import config from '@etherealengine/common/src/config'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { loadAvatarModelAsset } from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkActions'
import { V_010 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { Network } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { setTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { VRM } from '@pixiv/three-vrm'

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
    NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
    dispatchAction(
      AvatarNetworkAction.spawn({
        position: new Vector3(0, 0, column),
        rotation: new Quaternion().setFromAxisAngle(V_010, Math.PI),
        $from: userId,
        entityUUID: userId
      })
    )
    dispatchAction({ ...AvatarNetworkAction.setAvatarID({ avatarID: avatar.id, entityUUID: userId }), $from: userId })
  }
}

export const loadNetworkAvatar = (avatar: AvatarType, i: number, u = 'user', x = 0) => {
  const avatarDetail = {
    thumbnailURL: avatar.thumbnailResource?.url || '',
    avatarURL: avatar.modelResource?.url || '',
    avatarId: avatar.id ?? ''
  }
  const userId = (u + i) as UserID & PeerID
  const index = (1000 + i) as NetworkId
  NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
  dispatchAction(
    AvatarNetworkAction.spawn({
      position: new Vector3(x, 0, i * 2),
      rotation: new Quaternion().setFromAxisAngle(V_010, Math.PI),
      $from: userId,
      entityUUID: userId
    })
  )
  dispatchAction({ ...AvatarNetworkAction.setAvatarID({ avatarID: avatar.id, entityUUID: userId }), $from: userId })
  return userId
}

export const mockLoopAnimAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithLoopAnimation(avatar.modelResource?.url || '', new Vector3(4, 0, column), i)
  }
}

export const mockTPoseAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetTPose(avatar.modelResource?.url || '', new Vector3(8, 0, column), i)
  }
}

export const mockIKAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithIK(avatar, new Vector3(12, 0, column), i)
  }
}

export const loadAssetWithIK = (avatar: AvatarType, position: Vector3, i: number) => {
  const userId = loadNetworkAvatar(avatar, i, 'user_ik', position.x)
  setTimeout(() => {
    dispatchAction({
      ...AvatarNetworkAction.spawnIKTarget({
        name: 'head',
        entityUUID: (userId + ikTargets.head) as EntityUUID,
        blendWeight: 1
      }),
      $from: userId
    })
    dispatchAction({
      ...AvatarNetworkAction.spawnIKTarget({
        name: 'leftHand',
        entityUUID: (userId + ikTargets.leftHand) as EntityUUID,
        blendWeight: 1
      }),
      $from: userId
    })
    dispatchAction({
      ...AvatarNetworkAction.spawnIKTarget({
        name: 'rightHand',
        entityUUID: (userId + ikTargets.rightHand) as EntityUUID,
        blendWeight: 1
      }),
      $from: userId
    })
  }, 100)
}

export const loadAssetTPose = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'TPose Avatar ' + i)
  setTransformComponent(entity, position, new Quaternion().setFromAxisAngle(V_010, Math.PI))
  const vrm = (await loadAvatarModelAsset(filename)) as VRM
  addObjectToGroup(entity, vrm.scene)
  setComponent(entity, VisibleComponent, true)

  vrm.scene.traverse((obj: Mesh) => {
    if (obj.isMesh) {
      obj.material = new MeshNormalMaterial()
    }
  })

  return entity
}

export const loadAssetWithLoopAnimation = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'Anim Avatar ' + i + ' ' + filename.split('/').pop())
  setTransformComponent(entity, position, new Quaternion().setFromAxisAngle(V_010, Math.PI))
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, LoopAnimationComponent, {
    hasAvatarAnimations: true,
    activeClipIndex: 0,
    animationPack: config.client.fileServer + '/projects/default-project/assets/animations/wave.fbx'
  })
  setComponent(entity, ModelComponent, { src: filename, generateBVH: false, avoidCameraOcclusion: true })
  return entity
}
