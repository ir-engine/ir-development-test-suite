import React, { useEffect } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { mockAnimAvatars, mockIKAvatars, mockNetworkAvatars, mockTPoseAvatars } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))
  const avatarList = useHookstate(getMutableState(AvatarState).avatarList)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (engineState.connectedWorld.value) {
      const avatars = getState(AvatarState).avatarList.filter((avatar) => !avatar.modelResource?.url?.endsWith('vrm'))
      mockNetworkAvatars(avatars)
      // mockIKAvatars(avatars)
      // mockAnimAvatars(avatars)
      // mockTPoseAvatars(avatars)
    }
  }, [engineState.connectedWorld, avatarList])

  return <Template />
}
