import { useEffect } from 'react'

import { NO_PROXY, useHookstate } from '@ir-engine/hyperflux'

import { useWorldNetwork } from '@ir-engine/client-core/src/common/services/LocationInstanceConnectionService'
import { AvatarType } from '@ir-engine/common/src/schema.type.module'
import { useAvatarData } from '../engine/TestUtils'
import { useRouteScene } from '../sceneRoute'
import {
  mockIKAvatars,
  mockLoopAnimAvatars,
  mockNetworkAvatars,
  mockTPoseAvatars
} from './utils/avatar/loadAvatarHelpers'

export const metadata = {
  title: 'Avatar Test',
  description: ''
}

export default function AvatarTestEntry() {
  const network = useWorldNetwork()
  const sceneEntity = useRouteScene()
  const avatarList = useAvatarData()
  const created = useHookstate(false)

  useEffect(() => {
    if (sceneEntity && network?.ready?.value && avatarList.value.length > 0 && !created.value) {
      created.set(true)
      const data = [...avatarList.get(NO_PROXY)] as AvatarType[]
      mockNetworkAvatars(data)
      mockIKAvatars(data)
      mockLoopAnimAvatars(data)
      mockTPoseAvatars(data)
    }
  }, [network?.ready, avatarList, sceneEntity])

  return null
}
