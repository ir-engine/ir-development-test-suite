import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { AvatarService, AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars, mockIKAvatars } from './utils/loadAvatarHelpers'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useSimulateMovement } from './utils/simulateMovement'
import { useOfflineScene, useLoadEngineWithScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
    AvatarService.fetchAvatarList()
  }, [])


  useEffect(() => {
    if (engineState.joinedWorld.value) {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const indexStr = urlParams.get('index') as any
      const index = parseInt(indexStr) | 0
  
      const avatars = getMutableState(AvatarState).avatarList.value
      mockNetworkAvatars([avatars[index]])
      mockIKAvatars([avatars[index]])
      mockAnimAvatars([avatars[index]])
      mockTPoseAvatars([avatars[index]])
    }
  }, [engineState.joinedWorld])

  useOfflineScene({ projectName, sceneName, spectate: true })
  useLoadEngineWithScene({ injectedSystems: DefaultLocationSystems, spectate: true })
  useSimulateMovement()

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LocationIcons />
    </>
  )
}
