import React, { useEffect, useState } from 'react'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@etherealengine/hyperflux'
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { createPhysicsObjects } from './utils/loadPhysicsHelpers'
import { useLoadEngineWithScene, useOfflineScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'

process.env['APP_ENV'] = 'test'

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'

  const [count, setCount] = useState(1000)

  const [entities, setEntities] = useState([] as Entity[])

  useOfflineScene({ projectName, sceneName, spectate: true })
  useLoadLocationScene()
  useLoadEngineWithScene({ injectedSystems: DefaultLocationSystems, spectate: true })

  useEffect(() => {
    AvatarService.fetchAvatarList()
  }, [])

  useEffect(() => {
    if (!engineState.joinedWorld.value) return
    for (let i = 0; i < entities.length; i++) removeEntity(entities[i])
    setEntities(createPhysicsObjects(count))
  }, [count, engineState.joinedWorld])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <div style={{ pointerEvents: 'all' }}>
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}
