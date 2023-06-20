import { AvatarState } from "@etherealengine/client-core/src/user/services/AvatarService"
import { AvatarInterface } from "@etherealengine/common/src/interfaces/AvatarInterface"
import { EntityUUID } from "@etherealengine/common/src/interfaces/EntityUUID"
import { NetworkId } from "@etherealengine/common/src/interfaces/NetworkId"
import { PeerID } from "@etherealengine/common/src/interfaces/PeerID"
import { UserId } from "@etherealengine/common/src/interfaces/UserId"
import { AnimationComponent } from "@etherealengine/engine/src/avatar/components/AnimationComponent"
import { AvatarAnimationComponent } from "@etherealengine/engine/src/avatar/components/AvatarAnimationComponent"
import { AvatarComponent } from "@etherealengine/engine/src/avatar/components/AvatarComponent"
import { xrTargetHeadSuffix, xrTargetLeftHandSuffix, xrTargetRightHandSuffix } from "@etherealengine/engine/src/avatar/components/AvatarIKComponents"
import { loadAvatarModelAsset, boneMatchAvatarModel, rigAvatarModel, setupAvatarModel, animateModel } from "@etherealengine/engine/src/avatar/functions/avatarFunctions"
import { Engine } from "@etherealengine/engine/src/ecs/classes/Engine"
import { addComponent, getComponent, setComponent } from "@etherealengine/engine/src/ecs/functions/ComponentFunctions"
import { createEntity } from "@etherealengine/engine/src/ecs/functions/EntityFunctions"
import { Network } from "@etherealengine/engine/src/networking/classes/Network"
import { NetworkPeerFunctions } from "@etherealengine/engine/src/networking/functions/NetworkPeerFunctions"
import { WorldNetworkAction } from "@etherealengine/engine/src/networking/functions/WorldNetworkAction"
import { addObjectToGroup } from "@etherealengine/engine/src/scene/components/GroupComponent"
import { NameComponent } from "@etherealengine/engine/src/scene/components/NameComponent"
import { VisibleComponent } from "@etherealengine/engine/src/scene/components/VisibleComponent"
import { setTransformComponent } from "@etherealengine/engine/src/transform/components/TransformComponent"
import { XRAction } from "@etherealengine/engine/src/xr/XRState"
import { dispatchAction, getMutableState } from "@etherealengine/hyperflux"
import { Vector3, Quaternion, AnimationMixer, Object3D, MeshPhongMaterial, Color, Mesh } from "three"

export const getAvatarLists = () => {
  const avatarState = getMutableState(AvatarState)
  const avatarList = avatarState.avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
  return avatarList
}

export const mockNetworkAvatars = (avatarList: AvatarInterface[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const avatarDetail = {
      thumbnailURL: avatar.thumbnailResource?.LOD0_url || avatar.thumbnailResource?.url || '',
      avatarURL: avatar.modelResource?.LOD0_url || avatar.modelResource?.url || '',
      avatarId: avatar.id!
    }
    const userId = ('user' + i) as UserId & PeerID
    const index = (1000 + i) as NetworkId
    const column = i * 2
  
    NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
    dispatchAction(
      WorldNetworkAction.spawnAvatar({
        position: new Vector3(0, 0, column),
        rotation: new Quaternion(),
        $from: userId,
        uuid: userId
      })
    )
    dispatchAction({ ...WorldNetworkAction.avatarDetails({ avatarDetail, uuid: userId }), $from: userId })
  }
}

export const loadNetworkAvatar = (avatar: AvatarInterface, i: number, u = 'user', x = 0) => {
  const avatarDetail = {
    thumbnailURL: avatar.thumbnailResource?.LOD0_url || avatar.thumbnailResource?.url || '',
    avatarURL: avatar.modelResource?.LOD0_url || avatar.modelResource?.url || '',
    avatarId: avatar.id ?? ''
  }
  const userId = u + i as UserId & PeerID
  const index = (1000 + i) as NetworkId
  NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
  dispatchAction(
    WorldNetworkAction.spawnAvatar({
      position: new Vector3(x, 0, i * 2),
      rotation: new Quaternion(),
      $from: userId,
      uuid: userId
    })
  )
  dispatchAction({ ...WorldNetworkAction.avatarDetails({ avatarDetail, uuid: userId }), $from: userId })
  return userId
}

export const mockAnimAvatars = async (avatarList: AvatarInterface[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithAnimation(avatar.modelResource?.LOD0_url || avatar.modelResource?.url || '', new Vector3(4, 0, column), i)
  }
}

export const mockTPoseAvatars = async (avatarList: AvatarInterface[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetTPose(avatar.modelResource?.LOD0_url || avatar.modelResource?.url || '', new Vector3(8, 0, column), i)
  }
}

export const mockIKAvatars = async (avatarList: AvatarInterface[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithIK(avatar, new Vector3(12, 0, column), i)
  }
}

export const loadAssetWithIK = (avatar: AvatarInterface, position: Vector3, i: number) => {
  const userId = loadNetworkAvatar(avatar, i, 'user_ik', position.x) 
  setTimeout(() => {
    dispatchAction({ ...XRAction.spawnIKTarget({ handedness: 'none', uuid: userId + xrTargetHeadSuffix as EntityUUID }), $from: userId,  })
    dispatchAction({ ...XRAction.spawnIKTarget({ handedness: 'left', uuid: userId + xrTargetLeftHandSuffix as EntityUUID }), $from: userId,  })
    dispatchAction({ ...XRAction.spawnIKTarget({ handedness: 'right', uuid: userId + xrTargetRightHandSuffix as EntityUUID }), $from: userId,  })
  }, 100)
}

export const loadAssetTPose = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'TPose Avatar ' + i)
  setComponent(entity, AvatarComponent)
  addComponent(entity, AnimationComponent, {
    // empty object3d as the mixer gets replaced when model is loaded
    mixer: new AnimationMixer(new Object3D()),
    animations: [],
    animationSpeed: 1
  })
  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: () => { }
    },
    rootYRatio: 1,
    locomotion: new Vector3()
  })
  setTransformComponent(entity, position)
  const model = await loadAvatarModelAsset(filename) as Object3D
  addObjectToGroup(entity, model)
  addComponent(entity, VisibleComponent, true)
  boneMatchAvatarModel(entity)(model)
  rigAvatarModel(entity)(model)

  //Change material color to white
  model.traverse((obj: Mesh) => {
    if (obj.isMesh) {
      obj.material = new MeshPhongMaterial({ color: new Color('white') })
    }
  })

  const ac = getComponent(entity, AnimationComponent)
  //Apply tpose
  ac.mixer?.stopAllAction()
  return entity
}

export const loadAssetWithAnimation = async (filename, position: Vector3, i: number) => {
  const entity = createEntity()
  setComponent(entity, NameComponent, 'Anim Avatar ' + i)
  setComponent(entity, AvatarComponent)
  addComponent(entity, AnimationComponent, {
    // empty object3d as the mixer gets replaced when model is loaded
    mixer: new AnimationMixer(new Object3D()),
    animations: [],
    animationSpeed: 1
  })
  const animationComponent = getComponent(entity, AnimationComponent)
  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    },
    rootYRatio: 1,
    locomotion: new Vector3()
  })
  setTransformComponent(entity, position)
  const object = await loadAvatarModelAsset(filename) as Object3D
  addObjectToGroup(entity, object)
  addComponent(entity, VisibleComponent, true)
  const setupLoopableAvatarModel = setupAvatarModel(entity)
  setupLoopableAvatarModel(object)
  animationComponent.mixer.stopAllAction()
  animateModel(entity)
  return entity
}