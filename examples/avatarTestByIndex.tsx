import React, { useEffect } from 'react'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { accessAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { loadSceneJsonOffline } from '@xrengine/client/src/pages/offline/utils'
import { EngineState, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { dispatchAction, getState } from '@xrengine/hyperflux'
import { AvatarService, AvatarState } from '@xrengine/client-core/src/user/services/AvatarService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars } from './utils/loadAvatarHelpers'
import { LocationIcons } from '@xrengine/client-core/src/components/LocationIcons'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    getState(EngineState).avatarLoadingEffect.set(false)
    AvatarService.fetchAvatarList()
    matchActionOnce(EngineActions.joinedWorld.matches, mockAvatars)
  }, [])

  const mockAvatars = () => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const indexStr = urlParams.get('index') as any
    const index = parseInt(indexStr) | 0

    const avatars = getState(AvatarState).avatarList.value
    mockNetworkAvatars([avatars[index]])
    mockAnimAvatars([avatars[index]])
    mockTPoseAvatars([avatars[index]])
  }

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: `${projectName}/${sceneName}` }))
    loadSceneJsonOffline(projectName, sceneName)
  }, [])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
      <LocationIcons />
    </>
  )
}
