import { useEffect } from 'react'

import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'

import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { AvatarType } from '@etherealengine/common/src/schema.type.module'
import { useRandomAvatarData } from '../engine/TestUtils'
import { useRouteScene } from '../sceneRoute'
import {
  mockIKAvatars,
  mockLoopAnimAvatars,
  mockNetworkAvatars,
  mockTPoseAvatars
} from './utils/avatar/loadAvatarHelpers'

export default function AvatarBenchmarking() {
  const network = useWorldNetwork()
  const sceneEntity = useRouteScene()
  const avatarData = useRandomAvatarData()
  const created = useHookstate(false)

  useEffect(() => {
    if (sceneEntity.value && network?.ready.value && avatarData.value && !created.value) {
      created.set(true)

      const avatar = avatarData.get(NO_PROXY) as AvatarType

      mockNetworkAvatars([avatar])
      mockIKAvatars([avatar])
      mockLoopAnimAvatars([avatar])
      mockTPoseAvatars([avatar])
    }
  }, [network?.ready, avatarData, sceneEntity])

  return null
}
