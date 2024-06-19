import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { avatarPath } from '@etherealengine/common/src/schemas/user/avatar.schema'
import {
  mockIKAvatars,
  mockLoopAnimAvatars,
  mockNetworkAvatars,
  mockTPoseAvatars
} from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'
import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { AnimationState } from '@etherealengine/engine/src/avatar/AnimationManager'

export default function avatarIkTesting() {
  const network = useWorldNetwork()
  const avatarList = useFind(avatarPath, {
    query: {
      $skip: 0,
      $limit: 100
    }
  })
  const created = useHookstate(false)

  useEffect(() => {
    getMutableState(AnimationState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (network?.ready?.value && avatarList.data.length > 0 && !created.value) {
      created.set(true)
      const data = [...avatarList.data]
      mockIKAvatars(data, 5)
    }
  }, [network?.ready, avatarList.data.length])

  return <Template />
}
