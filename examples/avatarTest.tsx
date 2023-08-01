import React, { useEffect } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { mockAnimAvatars, mockIKAvatars, mockNetworkAvatars, mockTPoseAvatars } from './utils/loadAvatarHelpers'
import { Template } from './utils/template'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'

export default function AvatarTest() {
  const worldNetworkID = useHookstate(getMutableState(NetworkState).hostIds.world)
  const avatarList = useHookstate(getMutableState(AvatarState).avatarList)
  const spawned = useHookstate(false)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (worldNetworkID.value && avatarList.length && !spawned.value) {
      const avatars = getState(AvatarState).avatarList
      mockNetworkAvatars(avatars)
      mockIKAvatars(avatars)
      mockAnimAvatars(avatars)
      mockTPoseAvatars(avatars)
      spawned.set(true)
    }
  }, [worldNetworkID, avatarList])

  return <Template />
}
