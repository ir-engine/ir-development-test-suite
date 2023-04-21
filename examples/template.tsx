import React, { useEffect } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { useOfflineScene, useLoadEngineWithScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { useDefaultLocationSystems } from '@etherealengine/client-core/src/world/useDefaultLocationSystems'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'

export function Template() {
  const engineState = useHookstate(getMutableState(EngineState))

  const projectName = 'default-project'
  const sceneName = 'default'

  useOfflineScene({ projectName, sceneName, spectate: true })
  useLoadLocationScene()
  useLoadEngineWithScene({ spectate: true })
  useDefaultLocationSystems(true)

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [engineState.joinedWorld])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
    </>
  )
}
