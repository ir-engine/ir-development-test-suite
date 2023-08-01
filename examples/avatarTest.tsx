import React, { useEffect } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { mockAnimAvatars, mockIKAvatars, mockNetworkAvatars, mockTPoseAvatars } from './utils/loadAvatarHelpers'
import { Template } from './utils/template'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

export default function AvatarTest() {
  const worldNetwork = useHookstate(Engine.instance.worldNetworkState)
  const avatarList = useHookstate(getMutableState(AvatarState).avatarList)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)
  }, [])

  useEffect(() => {
    if (worldNetwork.value) {
      const avatars = getState(AvatarState).avatarList.filter((avatar) => !avatar.modelResource?.url?.endsWith('vrm'))
      mockNetworkAvatars(avatars)
      // mockIKAvatars(avatars)
      // mockAnimAvatars(avatars)
      // mockTPoseAvatars(avatars)
    }
  }, [worldNetwork, avatarList])

  return <Template />
}
