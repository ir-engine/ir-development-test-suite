import React, { useEffect } from 'react'

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
    if (engineState.connectedWorld.value && avatarList.data.length > 0) {
      // mockNetworkAvatars(avatarList.data)
      // mockIKAvatars(avatarList.data)
      mockLoopAnimAvatars(avatarList.data)
      // mockTPoseAvatars(avatarList.data)
    }
  }, [engineState.connectedWorld, avatarList.data.length])

  return <Template />
}
