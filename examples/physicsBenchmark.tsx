import React, { useEffect, useState } from 'react'

import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { createPhysicsObjects } from './utils/common/loadPhysicsHelpers'
import { Template } from './utils/template'

export default function AvatarBenchmarking() {
  const sceneState = useHookstate(getMutableState(SceneState))

  const [count, setCount] = useState(1000)

  const [entities, setEntities] = useState([] as Entity[])

  useEffect(() => {
    if (!sceneState.sceneLoaded.value) return
    for (let i = 0; i < entities.length; i++) removeEntity(entities[i])
    setEntities(createPhysicsObjects(count))
  }, [count, sceneState.sceneLoaded])

  return (
    <>
      <Template />
      <div style={{ pointerEvents: 'all' }}>
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}
