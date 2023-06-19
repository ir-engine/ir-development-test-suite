import React from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { useOfflineScene, useLoadEngineWithScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadLocationScene, useLoadScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { useDefaultLocationSystems } from '@etherealengine/client-core/src/world/useDefaultLocationSystems'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

export function Template() {
  const engineState = useHookstate(getMutableState(EngineState))

  const projectName = 'default-project'
  const sceneName = 'default'

  useLoadScene({ projectName, sceneName })
  useOfflineScene({ spectate: true })
  useLoadLocationScene()
  useLoadEngineWithScene({ spectate: true })
  useDefaultLocationSystems(true)

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
    </>
  )
}
