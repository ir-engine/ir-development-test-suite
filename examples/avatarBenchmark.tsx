import { Quaternion, Vector3 } from 'three'
import React, { useEffect } from 'react'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { dispatchAction } from '@xrengine/hyperflux'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import OfflineLocation from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'

import Layout from '@xrengine/client-core/src/components/Layout'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { loadSceneJsonOffline } from '@xrengine/client/src/pages/offline/utils'
import { accessAuthState, AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

const mockAvatars = () => {
  const authState = accessAuthState()
  const avatarList = authState.avatarList.value
    .filter((avatar) => !avatar.avatar?.url!.endsWith('vrm'))

  for (let i = 0; i < avatarList.length; i++) {
    const avatar = avatarList[i]
    const avatarDetail = {
      thumbnailURL: avatar['user-thumbnail']?.url!,
      avatarURL: avatar.avatar?.url!,
      avatarId: avatar.avatar?.name!
    }
    const userId = ('user' + i) as UserId
    const networkId = (1000 + i) as NetworkId
    const column = ((avatarList.length / 2) - i) * 2
    const parameters = {
      position: new Vector3(0, 0, column),
      rotation: new Quaternion()
    }

    dispatchAction(Engine.instance.currentWorld.store, {
      ...NetworkWorldAction.createClient({ name: 'user', index: networkId }),
      $from: userId
    })
    dispatchAction(Engine.instance.currentWorld.store, {
      ...NetworkWorldAction.spawnAvatar({ parameters, prefab: 'avatar' }),
      networkId,
      $from: userId
    })
    dispatchAction(Engine.instance.currentWorld.store, { ...NetworkWorldAction.avatarDetails({ avatarDetail }), $from: userId })
  }
}

export default function AvatarBenchmarking () {
  const authState = useAuthState()
  useEffect(() => {
    AuthService.fetchAvatarList()
    matchActionOnce(Engine.instance.store, EngineActions.joinedWorld.matches, mockAvatars)
  }, [])


  const dispatch = useDispatch()
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    dispatch(LocationAction.setLocationName(`${projectName}/${sceneName}`))
    loadSceneJsonOffline(projectName, sceneName)
  }, [])

  return (
    <Layout  useLoadingScreenOpacity pageTitle={'avatar benchmark'}>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
    </ Layout>
  )
}