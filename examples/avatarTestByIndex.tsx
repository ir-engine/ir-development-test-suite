import React, { useEffect } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { mockLoopAnimAvatars, mockIKAvatars, mockNetworkAvatars, mockTPoseAvatars } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))
  const avatarList = useFind(avatarPath, { 
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (engineState.connectedWorld.value && avatarList.data.length) {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const indexStr = urlParams.get('index') as any
      const index = parseInt(indexStr) | 0

      const avatars = getState(AvatarState).avatarList
      mockNetworkAvatars([avatars[index]])
      mockIKAvatars([avatars[index]])
      mockLoopAnimAvatars([avatars[index]])
      mockTPoseAvatars([avatars[index]])
    }
  }, [engineState.connectedWorld, avatarList.data])

  return <Template />
}
