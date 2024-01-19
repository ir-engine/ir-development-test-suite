import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { avatarPath } from '@etherealengine/common/src/schemas/user/avatar.schema'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import {
  mockIKAvatars,
  mockLoopAnimAvatars,
  mockNetworkAvatars,
  mockTPoseAvatars
} from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'

export default function AvatarBenchmarking() {
  const network = useWorldNetwork()
  const avatarList = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })
  const created = useHookstate(false)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (network?.ready.value && avatarList.data.length && !created.value) {
      created.set(true)
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString)
      const indexStr = urlParams.get('index') as any
      const index = parseInt(indexStr) | 0

      mockNetworkAvatars([avatarList.data[index]])
      mockIKAvatars([avatarList.data[index]])
      mockLoopAnimAvatars([avatarList.data[index]])
      mockTPoseAvatars([avatarList.data[index]])
    }
  }, [network?.ready, avatarList.data])

  return <Template />
}
