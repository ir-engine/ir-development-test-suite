import React, { useEffect, useState } from 'react'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { loadSceneJsonOffline } from '@xrengine/client/src/pages/offline/utils'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'
import { AvatarService } from '@xrengine/client-core/src/user/services/AvatarService'
import NumericInput from '@xrengine/editor/src/components/inputs/NumericInput'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createPhysicsObjects } from './utils/loadPhysicsHelpers'
import { LocationIcons } from '@xrengine/client-core/src/components/LocationIcons'

process.env['APP_ENV'] = 'test'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  const [count, setCount] = useState(100)

  const [entities, setEntities] = useState([] as Entity[])

  useEffect(() => {
    AvatarService.fetchAvatarList()
    dispatchAction(LocationAction.setLocationName({ locationName: `${projectName}/${sceneName}` }))
    loadSceneJsonOffline(projectName, sceneName)
  }, [])

  useEffect(() => {
    if (!engineState.joinedWorld.value) return
    for (let i = 0; i < entities.length; i++) removeEntity(entities[i])
    setEntities(createPhysicsObjects(count))
  }, [count, engineState.joinedWorld])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene />
      <OfflineLocation />
      <NumericInput onChange={setCount} value={count} />
      <LocationIcons />
    </>
  )
}
