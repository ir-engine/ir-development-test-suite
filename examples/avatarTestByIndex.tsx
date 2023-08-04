import React, { useEffect } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { mockAnimAvatars, mockIKAvatars, mockNetworkAvatars, mockTPoseAvatars } from './utils/avatar/loadAvatarHelpers'
import { useSimulateMovement } from './utils/avatar/simulateMovement'
import { Template } from './utils/template'

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))
  const avatarList = useHookstate(getMutableState(AvatarState).avatarList)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (engineState.connectedWorld.value && avatarList.length) {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const indexStr = urlParams.get('index') as any
      const index = parseInt(indexStr) | 0

      const avatars = getState(AvatarState).avatarList
      mockNetworkAvatars([avatars[index]])
      mockIKAvatars([avatars[index]])
      mockAnimAvatars([avatars[index]])
      mockTPoseAvatars([avatars[index]])
    }
  }, [engineState.connectedWorld, avatarList])

  useSimulateMovement()

  return <Template />
}
