import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { mockLoopAnimAvatars, mockIKAvatars, mockNetworkAvatars, mockTPoseAvatars, CreateSkinnedMeshGrid } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { useSimulateMovement } from './utils/avatar/simulateMovement'

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
      CreateSkinnedMeshGrid(avatarList.data, 64)
    }
  }, [engineState.connectedWorld, avatarList.data.length])

  return <Template />
}
