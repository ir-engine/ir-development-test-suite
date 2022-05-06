import React, { useEffect } from 'react'

import {
  AnimationMixer,
  SkeletonHelper,
  Object3D,
  Vector3,
  Quaternion,
} from 'three'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import OfflineLocation from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

import Layout from '@xrengine/client-core/src/components/Layout'
import { loadSceneJsonOffline } from '@xrengine/client/src/pages/offline/utils'

import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

import { AnimationState } from '@xrengine/engine/src/avatar/animation/AnimationState'
import { AvatarAnimationGraph } from '@xrengine/engine/src/avatar/animation/AvatarAnimationGraph'
import { BoneStructure } from '@xrengine/engine/src/avatar/AvatarBoneMatching'

import { loadAvatarModelAsset, setupAvatarModel } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { AvatarAnimationComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'

import { accessAuthState, AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'


import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import {
  addComponent,
  getComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'

export default function AvatarBenchmarking () {
  const dispatch = useDispatch()
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'
  let animationsList

  const authState = useAuthState()
  useEffect(() => {
    AuthService.fetchAvatarList()
    matchActionOnce(Engine.instance.store, EngineActions.joinedWorld.matches, mockAvatars)
  }, [])

  const mockAvatars = () => {
    initAvatars()
  }

  const loadAnimation = async () => {
    return await new Promise((resolve, reject) => {
      try {
        AssetLoader.load('/default_assets/Animations.glb', (gltf) => {
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

  const initAvatars = async () => {
    //Todo: loadAnimation
    const isloaded = await loadAnimation()
    if (isloaded) {
      const authState = accessAuthState()
      const avatarList = authState.avatarList.value
        .filter((avatar) => !avatar.avatar?.url!.endsWith('vrm'))
      for (let i = 0; i < avatarList.length; i++) {
        const avatar = avatarList[i]
        const column = ((avatarList.length / 2) - i) * 2
        loadAssetFileFromUrl(avatar.avatar?.url, new Vector3(0, 0, column))
      }
    }
  }

  const loadAssetFileFromUrl = async (filename, position = new Vector3()) => {
    const entity = createEntity()
    addComponent(entity, AnimationComponent, {
      // empty object3d as the mixer gets replaced when model is loaded
      mixer: new AnimationMixer(new Object3D()),
      animations: [],
      animationSpeed: 1
    })
    addComponent(entity, VelocityComponent, { linear: new Vector3(), angular: new Vector3() })
    addComponent(entity, AvatarAnimationComponent, {
      animationGraph: new AvatarAnimationGraph(),
      currentState: new AnimationState(),
      prevState: new AnimationState(),
      prevVelocity: new Vector3(),
      rig: {} as BoneStructure,
      rootYRatio: 1
    })
    const model = await loadAvatarModelAsset(filename)
    setupAvatarModel(entity)(model)
    //Todo: transform
    addComponent(entity, TransformComponent, {
      position,
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1)
    })
    addComponent(entity, Object3DComponent, {value: model})

    //Todo: random animation
    const animationTimeScale = 0.5 + Math.random() * 0.5
    const ac = getComponent(entity, AnimationComponent)
    const index = Math.floor(Math.random() * animationsList.length)
    const clipAction = ac.mixer.clipAction(animationsList[index])
    clipAction.setEffectiveTimeScale(animationTimeScale).play()
    clipAction.play()

    //Todo: Skeleton helper
    const av = getComponent(entity, AvatarAnimationComponent)
    const helper = new SkeletonHelper(av.rig.Hips)
    const helperEntity = createEntity()
    addComponent(helperEntity, Object3DComponent, {value: helper})
  }

  useEffect(() => {
    dispatch(LocationAction.setLocationName(`${projectName}/${sceneName}`))
    loadSceneJsonOffline(projectName, sceneName)
    setTimeout(() => {
      loadAssetFileFromUrl('')
    }, 10000)
  }, [])

  return (
    <Layout  useLoadingScreenOpacity pageTitle={'avatar animation'}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
    </ Layout>
  )
}