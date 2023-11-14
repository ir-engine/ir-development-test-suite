import React, { useEffect } from 'react'

import { useLoadEngineWithScene, useOfflineNetwork } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

export function Template(props: { projectName?: string; sceneName?: string }) {
  const engineState = useHookstate(getMutableState(EngineState))

  useLoadScene({ projectName: props.projectName ?? 'default-project', sceneName: props.sceneName ?? 'default' })
  useOfflineNetwork({ spectate: true })
  useLoadEngineWithScene({ spectate: true })

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [engineState.connectedWorld])

  return <></>
}
