import React from 'react'

import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { Template } from './utils/template'
import { setComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { BehaveGraphComponent } from '@etherealengine/engine/src/behave-graph/components/BehaveGraphComponent'
import { GraphJSON } from '@behave-graph/core'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { Flow } from '@etherealengine/editor/src/components/graph/ee-flow'
import '@etherealengine/editor/src/components/graph/ee-flow/styles.css'
import { BehaveGraphState } from '@etherealengine/engine/src/behave-graph/state/BehaveGraphState'
import AutoSizer from 'react-virtualized-auto-sizer'
import 'reactflow/dist/style.css'
import '@etherealengine/editor/src/components/graph/ee-flow/styles.css'
import isEqual from 'lodash/isEqual';
import targetJson from '../assets/graph/simpleController.json'


const entity = createEntity()
setComponent(entity, BehaveGraphComponent, { graph: targetJson as unknown as GraphJSON })

export default function behaveGraphTest() {
  const graphComponent = useComponent(entity, BehaveGraphComponent)
  const behavegraphState = useHookstate(getMutableState(BehaveGraphState))

  return <>
    <Template />
    <div style={{ pointerEvents: 'all', position: 'absolute', marginRight: '0px', maxWidth: '500px', width: '500px', height: '100%' }}>
    <AutoSizer>
      {({ width, height }) => (
        <div style={{ width, height }}>
            <Flow
              initialGraph={graphComponent?.value?.graph}
              examples={{}}
              registry={behavegraphState.registries.get(NO_PROXY)[graphComponent?.domain.value]}
              onChangeGraph={(newGraph) => {
                if (!graphComponent.graph || isEqual(graphComponent.graph.get(NO_PROXY),newGraph)) return
                graphComponent.graph.set(JSON.parse(JSON.stringify(newGraph)))
              }}
            />
        </div>
      )}
    </AutoSizer>
    </div>
  </>
}
