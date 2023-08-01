import { AnimationMixer, Color, Mesh, MeshPhongMaterial, Object3D, Quaternion, Vector3 } from 'three'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { AnimationComponent } from '@etherealengine/engine/src/avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import {
  xrTargetHeadSuffix,
  xrTargetLeftHandSuffix,
  xrTargetRightHandSuffix
} from '@etherealengine/engine/src/avatar/components/AvatarIKComponents'
import { loadAvatarModelAsset, rigAvatarModel } from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkState'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getComponent, setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { Network } from '@etherealengine/engine/src/networking/classes/Network'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { setTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { XRAction } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { config } from '@etherealengine/common/src/config'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'

export const getAvatarLists = () => {
  const avatarState = getMutableState(AvatarState)
  const avatarList = avatarState.avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
  return avatarList
}

export const mockNetworkAvatars = (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const userId = avatar.name + ' Networked' as UserId & PeerID
    const index = (1000 + i) as NetworkId
    const column = i * 2

    NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
    dispatchAction(
      AvatarNetworkAction.spawn({
        position: new Vector3(0, 0, column),
        rotation: new Quaternion(),
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
  const userId = (u + i) as UserId & PeerID
  const index = (1000 + i) as NetworkId
  NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
  dispatchAction(
    AvatarNetworkAction.spawn({
      position: new Vector3(x, 0, i * 2),
      rotation: new Quaternion(),
      $from: userId,
      entityUUID: userId
    })
  )
  dispatchAction({ ...AvatarNetworkAction.setAvatarID({ avatarID: avatar.id, entityUUID: userId }), $from: userId })
  return userId
}

export const mockAnimAvatars = async (avatarList: AvatarType[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithAnimation(avatar.modelResource?.url || '', new Vector3(4, 0, column), i)
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
  const userId = loadNetworkAvatar(avatar, i, avatar.name + ' IK', position.x)
  setTimeout(() => {
    dispatchAction({
      ...XRAction.spawnIKTarget({ name: 'head', entityUUID: (userId + xrTargetHeadSuffix) as EntityUUID }),
      $from: userId
    })
    dispatchAction({
      ...XRAction.spawnIKTarget({ name: 'lefthand', entityUUID: (userId + xrTargetLeftHandSuffix) as EntityUUID }),
      $from: userId
    })
    dispatchAction({
      ...XRAction.spawnIKTarget({ name: 'righthand', entityUUID: (userId + xrTargetRightHandSuffix) as EntityUUID }),
      $from: userId
    })
  }, 100)
}

export const loadAssetTPose = async (filename: string, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, filename.split('/').pop() + ' TPose ' + i)
  setTransformComponent(entity, position)
  setComponent(entity, VisibleComponent, true)
  const model = (await loadAvatarModelAsset(filename))!
  addObjectToGroup(entity, model.scene)

  //Change material color to white
  model.scene.traverse((obj: Mesh) => {
    if (obj.isMesh) {
      obj.material = new MeshPhongMaterial({ color: new Color('white') })
    }
  })

  return entity
}

export const loadAssetWithAnimation = async (filename: string, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, filename.split('/').pop() + ' Anim ' + i)
  setTransformComponent(entity, position)
  setComponent(entity, VisibleComponent, true)
  setComponent(entity, ModelComponent, { src: filename })
  setComponent(entity, LoopAnimationComponent, {
    hasAvatarAnimations: true,
    activeClipIndex: 0,
    animationPack: `${config.client.fileServer}/projects/ee-development-test-suite/assets/animations/test-animation.fbx`
  })
  return entity
}
