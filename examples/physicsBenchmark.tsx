import React, { useEffect, useState } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@etherealengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@etherealengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { loadSceneJsonOffline } from '@etherealengine/client/src/pages/offline/utils'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@etherealengine/hyperflux'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { createPhysicsObjects } from './utils/loadPhysicsHelpers'

process.env['APP_ENV'] = 'test'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  const [count, setCount] = useState(1000)

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
      <div style={{ pointerEvents: 'all' }}>
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}
