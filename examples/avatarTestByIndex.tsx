import React, { useEffect } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { mockAnimAvatars, mockIKAvatars, mockNetworkAvatars, mockTPoseAvatars } from './utils/loadAvatarHelpers'
import { useSimulateMovement } from './utils/simulateMovement'
import { Template } from './utils/template'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'

export default function AvatarBenchmarking() {
  const worldNetworkID = useHookstate(getMutableState(NetworkState).hostIds.world)
  const avatarList = useHookstate(getMutableState(AvatarState).avatarList)
  const spawned = useHookstate(false)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (worldNetworkID.value && avatarList.length && !spawned.value) {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const indexStr = urlParams.get('index') as any
      const index = parseInt(indexStr) | 0

      const avatars = getState(AvatarState).avatarList
      mockNetworkAvatars([avatars[index]])
      mockIKAvatars([avatars[index]])
      mockAnimAvatars([avatars[index]])
      mockTPoseAvatars([avatars[index]])
      spawned.set(true)
    }
  }, [worldNetworkID, avatarList])

  useSimulateMovement()

  return <Template />
}
