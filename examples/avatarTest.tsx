import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState } from '@etherealengine/hyperflux'

import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import {
  mockIKAvatars,
  mockLoopAnimAvatars,
  mockNetworkAvatars,
  mockTPoseAvatars
} from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'
import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'

export default function AvatarBenchmarking() {
  const network = useWorldNetwork()
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
    if (network?.ready.value && avatarList.data.length > 0) {
      mockNetworkAvatars(avatarList.data)
      mockIKAvatars(avatarList.data)
      mockLoopAnimAvatars(avatarList.data)
      mockTPoseAvatars(avatarList.data)
    }
  }, [network?.ready, avatarList.data.length])

  return <Template />
}
