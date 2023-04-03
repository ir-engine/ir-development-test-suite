import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineState, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { matchActionOnce } from '@etherealengine/engine/src/networking/functions/matchActionOnce'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { AvatarService, AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { accessAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars, mockIKAvatars } from './utils/loadAvatarHelpers'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useOfflineScene, useLoadEngineWithScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    AvatarService.fetchAvatarList()
    getMutableState(EngineState).avatarLoadingEffect.set(false)
    matchActionOnce(EngineActions.joinedWorld.matches, mockAvatars)
  }, [])

  const mockAvatars = () => {
    const avatars = getMutableState(AvatarState).avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
    mockNetworkAvatars(avatars)
    mockIKAvatars(avatars)
    mockAnimAvatars(avatars)
    mockTPoseAvatars(avatars)
  }

  useOfflineScene({ projectName, sceneName , spectate: false})
  useLoadLocationScene()
  useLoadEngineWithScene({ injectedSystems: DefaultLocationSystems, spectate: false })

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LocationIcons />
    </>
  )
}
