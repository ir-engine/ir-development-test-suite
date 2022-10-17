import React, { useEffect } from 'react'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { loadSceneJsonOffline } from '@xrengine/client/src/pages/offline/utils'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'
import { LocationIcons } from '@xrengine/client-core/src/components/LocationIcons'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  useEffect(() => {
    dispatchAction(LocationAction.setLocationName({ locationName: `${projectName}/${sceneName}` }))
    loadSceneJsonOffline(projectName, sceneName)
  }, [])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
      <LocationIcons />
    </>
  )
}
