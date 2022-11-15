import { accessAuthState } from "@xrengine/client-core/src/user/services/AuthService"
import { AvatarState } from "@xrengine/client-core/src/user/services/AvatarService"
import { AvatarInterface } from "@xrengine/common/src/interfaces/AvatarInterface"
import { NetworkId } from "@xrengine/common/src/interfaces/NetworkId"
import { PeerID } from "@xrengine/common/src/interfaces/PeerID"
import { UserId } from "@xrengine/common/src/interfaces/UserId"
import { BoneStructure } from "@xrengine/engine/src/avatar/AvatarBoneMatching"
import { AnimationComponent } from "@xrengine/engine/src/avatar/components/AnimationComponent"
import { AvatarAnimationComponent } from "@xrengine/engine/src/avatar/components/AvatarAnimationComponent"
import { loadAvatarModelAsset, boneMatchAvatarModel, rigAvatarModel, setupAvatarModel, animateModel } from "@xrengine/engine/src/avatar/functions/avatarFunctions"
import { Engine } from "@xrengine/engine/src/ecs/classes/Engine"
import { addComponent, getComponent } from "@xrengine/engine/src/ecs/functions/ComponentFunctions"
import { createEntity } from "@xrengine/engine/src/ecs/functions/EntityFunctions"
import { NetworkPeerFunctions } from "@xrengine/engine/src/networking/functions/NetworkPeerFunctions"
import { WorldNetworkAction } from "@xrengine/engine/src/networking/functions/WorldNetworkAction"
import { addObjectToGroup } from "@xrengine/engine/src/scene/components/GroupComponent"
import { VisibleComponent } from "@xrengine/engine/src/scene/components/VisibleComponent"
import { setTransformComponent } from "@xrengine/engine/src/transform/components/TransformComponent"
import { dispatchAction, getState } from "@xrengine/hyperflux"
import { Vector3, Quaternion, AnimationMixer, Object3D, MeshPhongMaterial, Color } from "three"

export const getAvatarLists = () => {
  const avatarState = getState(AvatarState)
  const avatarList = avatarState.avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
  return avatarList
}

export const mockNetworkAvatars = (avatarList: AvatarInterface[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const avatarDetail = {
      thumbnailURL: avatar.thumbnailResource?.url!,
      avatarURL: avatar.modelResource?.url!,
      avatarId: avatar.id!
    }
    const userId = ('user' + i) as UserId & PeerID
    const index = (1000 + i) as NetworkId
    const column = i * 2

    const world = Engine.instance.currentWorld

  NetworkPeerFunctions.createPeer(world.worldNetwork, userId, index, userId, index, userId, world)
    dispatchAction(
      WorldNetworkAction.spawnAvatar({
        position: new Vector3(0, 0, column),
        rotation: new Quaternion(),
        $from: userId
      })
    )
    dispatchAction({ ...WorldNetworkAction.avatarDetails({ avatarDetail }), $from: userId })
  }
}

export const loadNetworkAvatar = (avatar: AvatarInterface, i: number) => {
  const world = Engine.instance.currentWorld
  const avatarDetail = {
    thumbnailURL: avatar.thumbnailResource?.url ?? '',
    avatarURL: avatar.modelResource?.url ?? '',
    avatarId: avatar.id ?? ''
  }
  const userId = ('user' + i) as UserId & PeerID
  const index = (1000 + i) as NetworkId
  NetworkPeerFunctions.createPeer(world.worldNetwork, userId, index, userId, index, userId, world)
  dispatchAction(
    WorldNetworkAction.spawnAvatar({
      position: new Vector3(0, 0, i * 2),
      rotation: new Quaternion(),
      $from: userId
    })
  )
  dispatchAction({ ...WorldNetworkAction.avatarDetails({ avatarDetail }), $from: userId })
}

export const mockAnimAvatars = async (avatarList: AvatarInterface[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetWithAnimation(avatar.modelResource?.url, new Vector3(4, 0, column))
  }
}

export const mockTPoseAvatars = async (avatarList: AvatarInterface[]) => {
  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const column = i * 2
    loadAssetTPose(avatar.modelResource?.url, new Vector3(8, 0, column))
  }
}

export const loadAssetTPose = async (filename, position = new Vector3()) => {
  const entity = createEntity()
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
  const model = await loadAvatarModelAsset(filename)
  addObjectToGroup(entity, model)
  addComponent(entity, VisibleComponent, true)
  boneMatchAvatarModel(entity)(model)
  rigAvatarModel(entity)(model)

  //Change material color to white
  model.traverse((obj) => {
    if (obj.isMesh) {
      obj.material = new MeshPhongMaterial({ color: new Color('white') })
    }
  })

  const ac = getComponent(entity, AnimationComponent)
  //Apply tpose
  ac.mixer?.stopAllAction()
  return entity
}

export const loadAssetWithAnimation = async (filename, position = new Vector3()) => {
  const entity = createEntity()
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
  const object = await loadAvatarModelAsset(filename)
  addObjectToGroup(entity, object)
  addComponent(entity, VisibleComponent, true)
  const setupLoopableAvatarModel = setupAvatarModel(entity)
  setupLoopableAvatarModel(object)
  animationComponent.mixer.stopAllAction()
  animateModel(entity)
  return entity
}
