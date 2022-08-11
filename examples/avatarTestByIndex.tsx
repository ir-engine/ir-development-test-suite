import React, { useEffect } from 'react'
import { AnimationMixer, Object3D, Quaternion, Vector3 } from 'three'

import Layout from '@xrengine/client-core/src/components/Layout'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import OfflineLocation from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { accessAuthState, AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import { loadSceneJsonOffline } from '@xrengine/client/src/pages/offline/utils'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { BoneStructure } from '@xrengine/engine/src/avatar/AvatarBoneMatching'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { loadAvatarModelAsset, setupAvatarModel } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { NetworkPeerFunctions } from '@xrengine/engine/src/networking/functions/NetworkPeerFunctions'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'
  let animationsList

  useEffect(() => {
    AuthService.fetchAvatarList()
    matchActionOnce(EngineActions.joinedWorld.matches, mockAvatars)
  }, [])

  const mockAvatars = () => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const indexStr = urlParams.get('index') as any
    const index = parseInt(indexStr) | 0

    mockNetworkAvatars(index)
    mockAnimAvatars(index)
  }

  const getAvatarLists = () => {
    const authState = accessAuthState()
    const avatarList = authState.avatarList.value.filter((avatar) => !avatar.avatar?.url!.endsWith('vrm'))
    return avatarList
  }

  const mockNetworkAvatars = (i) => {
    const avatarList = getAvatarLists()
    const avatar = avatarList[i]
    console.log('avatarDetail', avatar)
    const avatarDetail = {
      thumbnailURL: avatar['user-thumbnail']?.url!,
      avatarURL: avatar.avatar?.url!,
      avatarId: avatar.avatar?.name!
    }
    const userId = ('user' + i) as UserId
    const INDEX = (1000 + i) as NetworkId

    const world = Engine.instance.currentWorld

    NetworkPeerFunctions.createPeer(world.worldNetwork, userId, INDEX, userId, world),
      dispatchAction(
        WorldNetworkAction.spawnAvatar({
          position: new Vector3(),
          rotation: new Quaternion(),
          $from: userId
        })
      )
    dispatchAction({ ...WorldNetworkAction.avatarDetails({ avatarDetail }), $from: userId })
  }

  const mockAnimAvatars = async (i) => {
    //Todo: loadAnimation
    const isloaded = await loadAnimation()
    if (isloaded) {
      const avatarList = getAvatarLists()
      const avatar = avatarList[i]
      loadAssetWithAnimation(avatar.avatar?.url, new Vector3(1, 0, 0))
    }
  }

  const loadAnimation = async () => {
    return await new Promise((resolve, reject) => {
      try {
        AssetLoader.load('/default_assets/Animations.glb', {}, (gltf) => {
          animationsList = gltf.animations
          animationsList.forEach((clip) => {
            clip.tracks = clip.tracks.filter((track) => !track.name.match(/^CC_Base_/))
          })
          resolve(animationsList)
        })
      } catch (error) {
        reject(false)
      }
    })
  }

  const loadAssetWithAnimation = async (filename, position = new Vector3()) => {
    const entity = createEntity()
    addComponent(entity, AnimationComponent, {
      // empty object3d as the mixer gets replaced when model is loaded
      mixer: new AnimationMixer(new Object3D()),
      animations: [],
      animationSpeed: 1
    })
    addComponent(entity, VelocityComponent, { linear: new Vector3(), angular: new Vector3() })
    addComponent(entity, AvatarAnimationComponent, {
      animationGraph: {
        states: {},
        transitionRules: {},
        currentState: null!,
        stateChanged: () => {}
      },
      rig: {} as BoneStructure,
      bindRig: {} as BoneStructure,
      rootYRatio: 1,
      locomotion: new Vector3()
    })
    const model = await loadAvatarModelAsset(filename)
    addComponent(entity, Object3DComponent, { value: model })
    setupAvatarModel(entity)(model)
    //Todo: transform
    addComponent(entity, TransformComponent, {
      position,
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1)
    })
  }

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: `${projectName}/${sceneName}` }))
    loadSceneJsonOffline(projectName, sceneName)
  }, [])

  return (
    <Layout useLoadingScreenOpacity pageTitle={'avatar animation'}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
    </Layout>
  )
}
