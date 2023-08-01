import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { Template } from './utils/template'
import { createDefaultObject } from './utils/graph/loadGraphHelpers'
import targetJson from '../assets/graph/3dpersoncontroller.json'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { GraphJSON } from '@behave-graph/core'
export default function behaveGraphTest() {
  const engineState = useHookstate(getMutableState(EngineState))

  console.log("DEBUG started", engineState.connectedWorld.value)
  useEffect(() => {
    if (engineState.sceneLoaded.value) {
      const entity = createDefaultObject()
      setComponent(entity,BehaveGraphComponent,{graph:targetJson as unknown as GraphJSON, run:true})
      console.log("DEBUG entity is", entity)
    }
  }, [engineState.sceneLoaded])


  return <Template />
}
