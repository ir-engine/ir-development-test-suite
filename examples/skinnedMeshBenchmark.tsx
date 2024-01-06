import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState } from '@etherealengine/hyperflux'

import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { avatarPath } from '@etherealengine/common/src/schemas/user/avatar.schema'
import { CreateSkinnedMeshGrid } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'

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
      CreateSkinnedMeshGrid(avatarList.data, 64)
    }
  }, [network?.ready, avatarList.data.length])

  return <Template />
}
