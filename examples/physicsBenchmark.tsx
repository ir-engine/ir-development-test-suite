import React, { useEffect, useState } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { createPhysicsObjects } from './utils/common/loadPhysicsHelpers'
import { Template } from './avatarTemplate'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))

  const [count, setCount] = useState(1000)

  const [entities, setEntities] = useState([] as Entity[])

  useEffect(() => {
    if (!engineState.connectedWorld.value) return
    for (let i = 0; i < entities.length; i++) removeEntity(entities[i])
    setEntities(createPhysicsObjects(count))
  }, [count, engineState.connectedWorld])

  return (
    <>
      <Template />
      <div style={{ pointerEvents: 'all' }}>
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}
