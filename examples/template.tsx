import React from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { useOfflineScene, useLoadEngineWithScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useOfflineScene({ projectName, sceneName, spectate: true })
  useLoadLocationScene()
  useLoadEngineWithScene({ injectedSystems: DefaultLocationSystems, spectate: true })

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LocationIcons />
    </>
  )
}
