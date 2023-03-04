import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@etherealengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@etherealengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { loadSceneJsonOffline } from '@etherealengine/client/src/pages/offline/utils'
import { EngineState, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { matchActionOnce } from '@etherealengine/engine/src/networking/functions/matchActionOnce'
import { dispatchAction, getState } from '@etherealengine/hyperflux'
import { AvatarService, AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { accessAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars, mockIKAvatars } from './utils/loadAvatarHelpers'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    AvatarService.fetchAvatarList()
    getState(EngineState).avatarLoadingEffect.set(false)
    matchActionOnce(EngineActions.joinedWorld.matches, mockAvatars)
  }, [])

  const mockAvatars = () => {
    const avatars = getState(AvatarState).avatarList.value.filter((avatar) => !avatar.modelResource?.url!.endsWith('vrm'))
    mockNetworkAvatars(avatars)
    mockIKAvatars(avatars)
    mockAnimAvatars(avatars)
    mockTPoseAvatars(avatars)
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
