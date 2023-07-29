import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { Template } from './utils/template'
import { createPhysicsObject } from './utils/graph/loadGraphHelpers'
import defaultJson from './utils/graph/default-graph.json'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { GraphJSON } from '@etherealengine/engine/src/behave-graph/nodes'
export default function behaveGraphTest() {
  const engineState = useHookstate(getMutableState(EngineState))
  console.log("DEBUG started", engineState.connectedWorld.value)
  useEffect(() => {
    if (engineState.connectedWorld.value) {
      const entity = createPhysicsObject()
      console.log("DEBUG entity is", entity)
    }
  }, [engineState.connectedWorld])


  return <Template />
}
