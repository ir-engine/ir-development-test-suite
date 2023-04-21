import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { mockNetworkAvatars, mockAnimAvatars, mockTPoseAvatars, mockIKAvatars } from './utils/loadAvatarHelpers'
import { useSimulateMovement } from './utils/simulateMovement'
import { Template } from './template'

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (engineState.connectedWorld.value) {
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
  }, [engineState.connectedWorld])

  useSimulateMovement()

  return <Template />
}
