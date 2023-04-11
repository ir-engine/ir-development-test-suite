import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { AvatarService, AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars, mockIKAvatars } from './utils/loadAvatarHelpers'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useOfflineScene, useLoadEngineWithScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    AvatarService.fetchAvatarList()
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (engineState.joinedWorld.value) {
      const avatars = getMutableState(AvatarState).avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
      mockNetworkAvatars(avatars)
      mockIKAvatars(avatars)
      mockAnimAvatars(avatars)
      mockTPoseAvatars(avatars)
    }
  }, [engineState.joinedWorld])

  useOfflineScene({ projectName, sceneName, spectate: false })
  useLoadLocationScene()
  useLoadEngineWithScene({ injectedSystems: DefaultLocationSystems, spectate: false })

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LocationIcons />
    </>
  )
}
