import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@etherealengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@etherealengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { accessAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { loadSceneJsonOffline } from '@etherealengine/client/src/pages/offline/utils'
import { EngineState, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { matchActionOnce } from '@etherealengine/engine/src/networking/functions/matchActionOnce'
import { dispatchAction, getState } from '@etherealengine/hyperflux'
import { AvatarService, AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars, mockIKAvatars } from './utils/loadAvatarHelpers'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useSimulateMovement } from './utils/simulateMovement'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    getState(EngineState).avatarLoadingEffect.set(false)
    AvatarService.fetchAvatarList()
    matchActionOnce(EngineActions.joinedWorld.matches, mockAvatars)
  }, [])

  useSimulateMovement()

  const mockAvatars = () => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const indexStr = urlParams.get('index') as any
    const index = parseInt(indexStr) | 0

    const avatars = getState(AvatarState).avatarList.value
    mockNetworkAvatars([avatars[index]])
    mockIKAvatars([avatars[index]])
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
      <LoadEngineWithScene spectate/>
      <OfflineLocation />
      <LocationIcons />
    </>
  )
}
