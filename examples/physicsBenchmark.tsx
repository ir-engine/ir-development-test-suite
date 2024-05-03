import React, { useEffect, useState } from 'react'

import { Entity } from '@etherealengine/ecs/src/Entity'
import { removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { createPhysicsObjects } from './utils/common/loadPhysicsHelpers'
import { Template } from './utils/template'

export default function AvatarBenchmarking() {
  const sceneState = useHookstate(getMutableState(SceneState))

  const [count, setCount] = useState(1000)

  const [entities, setEntities] = useState([] as Entity[])

  useEffect(() => {
    for (let i = 0; i < entities.length; i++) removeEntity(entities[i])
    setEntities(createPhysicsObjects(count))
  }, [count])

  return (
    <>
      <Template />
      <div style={{ pointerEvents: 'all' }}>
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}
